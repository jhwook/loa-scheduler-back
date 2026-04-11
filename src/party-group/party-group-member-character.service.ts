import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PartyGroupMember } from './entities/party-group-member.entity';
import { PartyGroupMemberCharacter } from './entities/party-group-member-character.entity';
import { Character } from '../characters/entities/character.entity';
import { PartyGroup } from './entities/party-group.entity';
import { CharacterWeeklyRaidGate } from 'src/character-weekly-raid/entities/character-weekly-raid-gate.entity';

@Injectable()
export class PartyGroupMemberCharacterService {
  constructor(
    @InjectRepository(PartyGroup)
    private readonly partyGroupRepository: Repository<PartyGroup>,

    @InjectRepository(PartyGroupMember)
    private readonly partyGroupMemberRepository: Repository<PartyGroupMember>,

    @InjectRepository(PartyGroupMemberCharacter)
    private readonly partyGroupMemberCharacterRepository: Repository<PartyGroupMemberCharacter>,

    @InjectRepository(Character)
    private readonly charactersRepository: Repository<Character>,

    @InjectRepository(CharacterWeeklyRaidGate)
    private readonly characterWeeklyRaidGateRepository: Repository<CharacterWeeklyRaidGate>,
  ) {}

  async getMyCharactersForGroup(groupId: number, userId: number) {
    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 그룹에 접근할 수 없습니다.');
    }

    const myCharacters = await this.charactersRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const selectedRows = await this.partyGroupMemberCharacterRepository.find({
      where: {
        groupId,
        userId,
      },
    });

    const selectedCharacterIdSet = new Set(
      selectedRows.map((row) => row.characterId),
    );

    return myCharacters.map((character) => ({
      characterId: character.id,
      characterName: character.characterName,
      characterClassName: character.characterClassName,
      itemAvgLevel: character.itemAvgLevel,
      combatPower: character.combatPower,
      partyRole: character.partyRole,
      selected: selectedCharacterIdSet.has(character.id),
    }));
  }

  async updateMyCharactersForGroup(
    groupId: number,
    userId: number,
    characterIds: number[],
  ) {
    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 그룹에 접근할 수 없습니다.');
    }

    const myCharacters = await this.charactersRepository.find({
      where: {
        userId,
      },
    });

    const myCharacterIdSet = new Set(
      myCharacters.map((character) => character.id),
    );

    for (const characterId of characterIds) {
      if (!myCharacterIdSet.has(characterId)) {
        throw new NotFoundException(
          `내 캐릭터가 아니거나 존재하지 않는 캐릭터입니다. characterId=${characterId}`,
        );
      }
    }

    const existingRows = await this.partyGroupMemberCharacterRepository.find({
      where: {
        groupId,
        userId,
      },
    });

    const existingCharacterIdSet = new Set(
      existingRows.map((row) => row.characterId),
    );

    const incomingCharacterIdSet = new Set(characterIds);

    const rowsToDelete = existingRows.filter(
      (row) => !incomingCharacterIdSet.has(row.characterId),
    );

    const rowsToCreate = characterIds
      .filter((characterId) => !existingCharacterIdSet.has(characterId))
      .map((characterId) =>
        this.partyGroupMemberCharacterRepository.create({
          groupId,
          userId,
          characterId,
        }),
      );

    if (rowsToDelete.length > 0) {
      await this.partyGroupMemberCharacterRepository.remove(rowsToDelete);
    }

    if (rowsToCreate.length > 0) {
      await this.partyGroupMemberCharacterRepository.save(rowsToCreate);
    }

    return this.getMyCharactersForGroup(groupId, userId);
  }

  async getVisibleCharactersForGroup(groupId: number, requesterUserId: number) {
    const requesterMembership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: requesterUserId,
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('해당 그룹에 접근할 수 없습니다.');
    }

    const group = await this.partyGroupRepository.findOne({
      where: { id: groupId },
      relations: {
        members: {
          user: true,
        },
      },
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다.');
    }

    const visibleRows = await this.partyGroupMemberCharacterRepository.find({
      where: { groupId },
      relations: {
        character: true,
        user: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const characterIds = visibleRows.map((row) => row.characterId);

    const weeklyRaids = characterIds.length
      ? await this.characterWeeklyRaidGateRepository.find({
          where: characterIds.map((characterId) => ({ characterId })),
          relations: {
            raidGateInfo: {
              raidInfo: true,
            },
          },
          order: {
            createdAt: 'ASC',
          },
        })
      : [];

    const weeklyRaidMap = new Map<number, CharacterWeeklyRaidGate[]>();

    for (const weeklyRaid of weeklyRaids) {
      if (!weeklyRaidMap.has(weeklyRaid.characterId)) {
        weeklyRaidMap.set(weeklyRaid.characterId, []);
      }
      weeklyRaidMap.get(weeklyRaid.characterId)!.push(weeklyRaid);
    }

    const visibleCharacterMapByUserId = new Map<
      number,
      Array<{
        characterId: number;
        characterName: string;
        characterClassName: string | null;
        serverName: string | null;
        characterLevel: number | null;
        itemAvgLevel: string | null;
        itemMaxLevel: string | null;
        combatPower: string | null;
        partyRole: string | null;
        lastSyncedAt: Date | null;
        weeklyRaids: any[];
      }>
    >();

    for (const row of visibleRows) {
      const characterWeeklyRaids = weeklyRaidMap.get(row.characterId) ?? [];

      const mappedCharacter = {
        characterId: row.character.id,
        characterName: row.character.characterName,
        characterClassName: row.character.characterClassName,
        serverName: row.character.serverName,
        characterLevel: row.character.characterLevel,
        itemAvgLevel: row.character.itemAvgLevel,
        itemMaxLevel: row.character.itemMaxLevel,
        combatPower: row.character.combatPower,
        partyRole: row.character.partyRole,
        lastSyncedAt: row.character.lastSyncedAt,
        weeklyRaids: characterWeeklyRaids.map((weeklyRaid) => ({
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
            canExtraReward: weeklyRaid.raidGateInfo.canExtraReward,
            extraRewardCost: weeklyRaid.raidGateInfo.extraRewardCost,
            raidInfo: {
              id: weeklyRaid.raidGateInfo.raidInfo.id,
              raidName: weeklyRaid.raidGateInfo.raidInfo.raidName,
            },
          },
        })),
      };

      if (!visibleCharacterMapByUserId.has(row.userId)) {
        visibleCharacterMapByUserId.set(row.userId, []);
      }

      visibleCharacterMapByUserId.get(row.userId)!.push(mappedCharacter);
    }

    return {
      groupId: group.id,
      groupName: group.name,
      members: group.members.map((member) => ({
        memberId: member.id,
        userId: member.userId,
        username: member.user.username,
        nickname: member.nickname,
        displayName:
          member.nickname ?? member.user.nickname ?? member.user.username,
        role: member.role,
        characters: visibleCharacterMapByUserId.get(member.userId) ?? [],
      })),
    };
  }

  async getPartyBuilderCharacters(groupId: number, requesterUserId: number) {
    const requesterMembership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: requesterUserId,
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('해당 그룹에 접근할 수 없습니다.');
    }

    const visibleRows = await this.partyGroupMemberCharacterRepository.find({
      where: { groupId },
      relations: {
        character: true,
        user: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return visibleRows.map((row) => ({
      memberUserId: row.userId,
      ownerNickname: row.user.nickname,
      ownerUsername: row.user.username,
      ownerDisplayName: row.user.nickname ?? row.user.username,
      characterId: row.character.id,
      characterName: row.character.characterName,
      characterClassName: row.character.characterClassName,
      itemAvgLevel: row.character.itemAvgLevel,
      combatPower: row.character.combatPower,
      partyRole: row.character.partyRole, // DEALER | SUPPORT
    }));
  }
}
