import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartyGroup } from './entities/party-group.entity';
import { PartyGroupMember } from './entities/party-group-member.entity';
import { User } from '../users/entities/user.entity';
import { Character } from '../characters/entities/character.entity';
import { CharacterWeeklyRaidGate } from 'src/character-weekly-raid/entities/character-weekly-raid-gate.entity';

@Injectable()
export class PartyGroupService {
  constructor(
    @InjectRepository(PartyGroup)
    private readonly partyGroupRepository: Repository<PartyGroup>,

    @InjectRepository(PartyGroupMember)
    private readonly partyGroupMemberRepository: Repository<PartyGroupMember>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Character)
    private readonly charactersRepository: Repository<Character>,

    @InjectRepository(CharacterWeeklyRaidGate)
    private readonly characterWeeklyRaidGateRepository: Repository<CharacterWeeklyRaidGate>,
  ) {}

  async createGroup(
    ownerUserId: number,
    data: {
      name: string;
      description?: string;
    },
  ) {
    const owner = await this.usersRepository.findOne({
      where: { id: ownerUserId },
    });

    if (!owner) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const group = this.partyGroupRepository.create({
      name: data.name,
      description: data.description ?? null,
      ownerUserId,
      isActive: true,
    });

    const savedGroup = await this.partyGroupRepository.save(group);

    const ownerMember = this.partyGroupMemberRepository.create({
      groupId: savedGroup.id,
      userId: ownerUserId,
      role: 'OWNER',
      nickname: owner.nickname,
    });

    await this.partyGroupMemberRepository.save(ownerMember);

    return this.findGroupDetail(savedGroup.id, ownerUserId);
  }

  async findMyGroups(userId: number) {
    const memberships = await this.partyGroupMemberRepository.find({
      where: {
        userId,
      },
      relations: {
        group: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const groupIds = memberships.map((membership) => membership.groupId);

    if (groupIds.length === 0) {
      return [];
    }

    const memberCounts = await Promise.all(
      groupIds.map(async (groupId) => {
        const count = await this.partyGroupMemberRepository.count({
          where: { groupId },
        });

        return {
          groupId,
          count,
        };
      }),
    );

    const countMap = new Map(
      memberCounts.map((item) => [item.groupId, item.count]),
    );

    return memberships.map((membership) => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      ownerUserId: membership.group.ownerUserId,
      isActive: membership.group.isActive,
      myRole: membership.role,
      memberCount: countMap.get(membership.group.id) ?? 0,
      createdAt: membership.group.createdAt,
      updatedAt: membership.group.updatedAt,
    }));
  }

  async findGroupDetail(groupId: number, requesterUserId: number) {
    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 그룹에 접근할 수 없습니다.');
    }

    const group = await this.partyGroupRepository.findOne({
      where: { id: groupId },
      relations: {
        ownerUser: true,
        members: {
          user: true,
        },
      },
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다.');
    }

    const memberUserIds = group.members.map((member) => member.userId);

    const characters = await this.charactersRepository.find({
      where: memberUserIds.length
        ? memberUserIds.map((userId) => ({ userId }))
        : [],
      order: {
        createdAt: 'ASC',
      },
    });

    const weeklyRaidGates = await this.characterWeeklyRaidGateRepository.find({
      where: characters.length
        ? characters.map((character) => ({ characterId: character.id }))
        : [],
      relations: {
        raidGateInfo: {
          raidInfo: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const charactersByUserId = new Map<number, Character[]>();
    for (const character of characters) {
      if (!charactersByUserId.has(character.userId)) {
        charactersByUserId.set(character.userId, []);
      }
      charactersByUserId.get(character.userId)!.push(character);
    }

    const weeklyRaidByCharacterId = new Map<
      number,
      CharacterWeeklyRaidGate[]
    >();
    for (const weeklyRaid of weeklyRaidGates) {
      if (!weeklyRaidByCharacterId.has(weeklyRaid.characterId)) {
        weeklyRaidByCharacterId.set(weeklyRaid.characterId, []);
      }
      weeklyRaidByCharacterId.get(weeklyRaid.characterId)!.push(weeklyRaid);
    }

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      ownerUserId: group.ownerUserId,
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      members: group.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        username: member.user.username,
        nickname: member.nickname,
        displayName: member.nickname ?? member.user.username,
        role: member.role,
        joinedAt: member.joinedAt,
        characters: (charactersByUserId.get(member.userId) ?? []).map(
          (character) => ({
            id: character.id,
            characterName: character.characterName,
            serverName: character.serverName,
            characterClassName: character.characterClassName,
            characterLevel: character.characterLevel,
            itemAvgLevel: character.itemAvgLevel,
            combatPower: character.combatPower,
            lastSyncedAt: character.lastSyncedAt,
            weeklyRaids: (weeklyRaidByCharacterId.get(character.id) ?? []).map(
              (weeklyRaid) => ({
                id: weeklyRaid.id,
                isCleared: weeklyRaid.isCleared,
                isGoldEarned: weeklyRaid.isGoldEarned,
                isExtraRewardSelected: weeklyRaid.isExtraRewardSelected,
                extraRewardCostSnapshot: weeklyRaid.extraRewardCostSnapshot,
                raidGateInfo: {
                  id: weeklyRaid.raidGateInfo.id,
                  difficulty: weeklyRaid.raidGateInfo.difficulty,
                  gateNumber: weeklyRaid.raidGateInfo.gateNumber,
                  gateName: weeklyRaid.raidGateInfo.gateName,
                  rewardGold: weeklyRaid.raidGateInfo.rewardGold,
                  boundGold: weeklyRaid.raidGateInfo.boundGold,
                  isSingleMode: weeklyRaid.raidGateInfo.isSingleMode,
                  raidInfo: {
                    id: weeklyRaid.raidGateInfo.raidInfo.id,
                    raidName: weeklyRaid.raidGateInfo.raidInfo.raidName,
                  },
                },
              }),
            ),
          }),
        ),
      })),
    };
  }

  async addMember(
    groupId: number,
    requesterUserId: number,
    targetUserId: number,
    nickname?: string,
  ) {
    const requesterMembership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: requesterUserId,
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('해당 그룹에 접근할 수 없습니다.');
    }

    if (!['OWNER', 'ADMIN'].includes(requesterMembership.role)) {
      throw new ForbiddenException('멤버를 추가할 권한이 없습니다.');
    }

    const targetUser = await this.usersRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('추가할 유저를 찾을 수 없습니다.');
    }

    const existingMember = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: targetUserId,
      },
    });

    if (existingMember) {
      throw new BadRequestException('이미 그룹에 속한 유저입니다.');
    }

    const member = this.partyGroupMemberRepository.create({
      groupId,
      userId: targetUserId,
      role: 'MEMBER',
      nickname: targetUser.nickname,
    });

    await this.partyGroupMemberRepository.save(member);

    return this.findGroupDetail(groupId, requesterUserId);
  }

  async updateMemberNickname(
    groupId: number,
    memberId: number,
    requesterUserId: number,
    nickname?: string,
  ) {
    const requesterMembership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: requesterUserId,
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('해당 그룹에 접근할 수 없습니다.');
    }

    const member = await this.partyGroupMemberRepository.findOne({
      where: {
        id: memberId,
        groupId,
      },
    });

    if (!member) {
      throw new NotFoundException('그룹 멤버를 찾을 수 없습니다.');
    }

    // 본인만 자기 별명 수정 가능
    if (member.userId !== requesterUserId) {
      throw new ForbiddenException('본인 별명만 수정할 수 있습니다.');
    }

    member.nickname = nickname ?? null;
    await this.partyGroupMemberRepository.save(member);

    return this.findGroupDetail(groupId, requesterUserId);
  }

  async removeMember(
    groupId: number,
    memberId: number,
    requesterUserId: number,
  ) {
    const requesterMembership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: requesterUserId,
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('해당 그룹에 접근할 수 없습니다.');
    }

    if (!['OWNER', 'ADMIN'].includes(requesterMembership.role)) {
      throw new ForbiddenException('멤버를 삭제할 권한이 없습니다.');
    }

    const member = await this.partyGroupMemberRepository.findOne({
      where: {
        id: memberId,
        groupId,
      },
      relations: {
        user: true,
      },
    });

    if (!member) {
      throw new NotFoundException('그룹 멤버를 찾을 수 없습니다.');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('그룹장은 삭제할 수 없습니다.');
    }

    await this.partyGroupMemberRepository.remove(member);

    return {
      message: '그룹 멤버가 삭제되었습니다.',
      deletedMember: {
        id: member.id,
        userId: member.userId,
        username: member.user.username,
        nickname: member.nickname,
      },
    };
  }

  async leaveGroup(groupId: number, userId: number) {
    const group = await this.partyGroupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다.');
    }

    const myMembership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId,
      },
    });

    if (!myMembership) {
      throw new NotFoundException('그룹 멤버 정보를 찾을 수 없습니다.');
    }

    const memberCount = await this.partyGroupMemberRepository.count({
      where: { groupId },
    });

    // 공대장인 경우
    if (myMembership.role === 'OWNER') {
      // 혼자 남아 있으면 그룹 자체 삭제
      if (memberCount === 1) {
        await this.partyGroupRepository.remove(group);

        return {
          message: '마지막 멤버가 탈퇴하여 그룹이 삭제되었습니다.',
          deletedGroup: {
            id: group.id,
            name: group.name,
          },
        };
      }

      // 다른 멤버가 있으면 탈퇴 불가
      throw new BadRequestException(
        '공대장은 바로 탈퇴할 수 없습니다. 그룹장을 넘기거나 그룹을 삭제해주세요.',
      );
    }

    // 일반 멤버는 그냥 탈퇴
    await this.partyGroupMemberRepository.remove(myMembership);

    return {
      message: '그룹에서 탈퇴했습니다.',
      leftGroup: {
        id: group.id,
        name: group.name,
      },
    };
  }

  async deleteGroup(groupId: number, requesterUserId: number) {
    const group = await this.partyGroupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다.');
    }

    if (group.ownerUserId !== requesterUserId) {
      throw new ForbiddenException('그룹을 삭제할 권한이 없습니다.');
    }

    await this.partyGroupRepository.remove(group);

    return {
      message: '그룹이 삭제되었습니다.',
      deletedGroup: {
        id: group.id,
        name: group.name,
      },
    };
  }
}
