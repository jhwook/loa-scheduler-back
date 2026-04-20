import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartyGroup } from '../party-group/entities/party-group.entity';
import { PartyGroupMember } from '../party-group/entities/party-group-member.entity';
import { RaidInfo } from '../raid-info/entities/raid-info.entity';
import { Character } from '../characters/entities/character.entity';
import { PartyGroupMemberCharacter } from '../party-group/entities/party-group-member-character.entity';
import { RaidPartyMember } from './entites/raid-party-member.entity';
import { RaidParty } from './entites/raid-party.entity';
import { RaidGateInfo } from 'src/raid-info/entities/raid-gate-info.entity';

@Injectable()
export class RaidPartyService {
  constructor(
    @InjectRepository(RaidParty)
    private readonly raidPartyRepository: Repository<RaidParty>,

    @InjectRepository(RaidPartyMember)
    private readonly raidPartyMemberRepository: Repository<RaidPartyMember>,

    @InjectRepository(PartyGroup)
    private readonly partyGroupRepository: Repository<PartyGroup>,

    @InjectRepository(PartyGroupMember)
    private readonly partyGroupMemberRepository: Repository<PartyGroupMember>,

    @InjectRepository(RaidInfo)
    private readonly raidInfoRepository: Repository<RaidInfo>,

    @InjectRepository(Character)
    private readonly charactersRepository: Repository<Character>,

    @InjectRepository(PartyGroupMemberCharacter)
    private readonly partyGroupMemberCharacterRepository: Repository<PartyGroupMemberCharacter>,

    @InjectRepository(RaidGateInfo)
    private readonly raidGateInfoRepository: Repository<RaidGateInfo>,
  ) {}

  async createRaidParty(
    requesterUserId: number,
    data: {
      groupId: number;
      raidInfoId: number;
      title?: string;
      selectedDifficulty?: string;
    },
  ) {
    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId: data.groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 공격대에 접근할 수 없습니다.');
    }

    const group = await this.partyGroupRepository.findOne({
      where: { id: data.groupId },
    });

    if (!group) {
      throw new NotFoundException('공격대를 찾을 수 없습니다.');
    }

    const raidInfo = await this.raidInfoRepository.findOne({
      where: { id: data.raidInfoId },
    });

    if (!raidInfo) {
      throw new NotFoundException('레이드 정보를 찾을 수 없습니다.');
    }

    if (![4, 8].includes(raidInfo.partySize)) {
      throw new BadRequestException('레이드의 partySize가 올바르지 않습니다.');
    }

    // 난이도 유효성 체크: 해당 레이드에 실제 존재하는 난이도인지 확인
    if (data.selectedDifficulty) {
      const difficultyExists = await this.raidGateInfoRepository.findOne({
        where: {
          raidInfoId: data.raidInfoId,
          difficulty: data.selectedDifficulty,
        },
      });

      if (!difficultyExists) {
        throw new BadRequestException(
          '해당 레이드에 존재하지 않는 난이도입니다.',
        );
      }
    }

    const raidParty = this.raidPartyRepository.create({
      groupId: data.groupId,
      raidInfoId: data.raidInfoId,
      title: data.title ?? null,
      partySize: raidInfo.partySize,
      selectedDifficulty: data.selectedDifficulty ?? null,
      createdByUserId: requesterUserId,
    });

    const saved = await this.raidPartyRepository.save(raidParty);

    return this.raidPartyRepository.findOne({
      where: { id: saved.id },
      relations: {
        group: true,
        raidInfo: true,
        createdByUser: true,
      },
    });
  }

  async updateRaidParty(
    requesterUserId: number,
    raidPartyId: number,
    data: {
      title?: string;
      selectedDifficulty?: string | null;
    },
  ) {
    const raidParty = await this.raidPartyRepository.findOne({
      where: { id: raidPartyId },
      relations: {
        raidInfo: true,
      },
    });

    if (!raidParty) {
      throw new NotFoundException('공격대 파티를 찾을 수 없습니다.');
    }

    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId: raidParty.groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 공격대에 접근할 수 없습니다.');
    }

    if (
      data.selectedDifficulty !== undefined &&
      data.selectedDifficulty !== null
    ) {
      const difficultyExists = await this.raidGateInfoRepository.findOne({
        where: {
          raidInfoId: raidParty.raidInfoId,
          difficulty: data.selectedDifficulty,
        },
      });

      if (!difficultyExists) {
        throw new BadRequestException(
          '해당 레이드에 존재하지 않는 난이도입니다.',
        );
      }
    }

    if (data.title !== undefined) {
      raidParty.title = data.title;
    }

    if (data.selectedDifficulty !== undefined) {
      raidParty.selectedDifficulty = data.selectedDifficulty;
    }

    await this.raidPartyRepository.save(raidParty);

    return this.findRaidPartyDetail(requesterUserId, raidPartyId);
  }

  async addCharacterToRaidParty(
    requesterUserId: number,
    raidPartyId: number,
    data: {
      characterId: number;
      partyNumber: number;
      slotNumber: number;
      positionRole: 'DEALER' | 'SUPPORT';
    },
  ) {
    const raidParty = await this.raidPartyRepository.findOne({
      where: { id: raidPartyId },
      relations: {
        group: true,
        members: true,
      },
    });

    if (!raidParty) {
      throw new NotFoundException('공격대 파티를 찾을 수 없습니다.');
    }

    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId: raidParty.groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 공격대에 접근할 수 없습니다.');
    }

    const character = await this.charactersRepository.findOne({
      where: { id: data.characterId },
      relations: {
        user: true,
      },
    });

    if (!character) {
      throw new NotFoundException('캐릭터를 찾을 수 없습니다.');
    }

    // 이 그룹에서 공개된 캐릭터인지 확인
    const visibleCharacter =
      await this.partyGroupMemberCharacterRepository.findOne({
        where: {
          groupId: raidParty.groupId,
          characterId: data.characterId,
        },
      });

    if (!visibleCharacter) {
      throw new BadRequestException(
        '이 공격대에서 공개 설정된 캐릭터만 추가할 수 있습니다.',
      );
    }

    // 같은 파티에 같은 캐릭터 중복 배치 금지
    const existingCharacter = await this.raidPartyMemberRepository.findOne({
      where: {
        raidPartyId,
        characterId: data.characterId,
      },
    });

    if (existingCharacter) {
      throw new BadRequestException('이미 이 파티에 추가된 캐릭터입니다.');
    }

    // 같은 슬롯 중복 금지
    const existingSlot = await this.raidPartyMemberRepository.findOne({
      where: {
        raidPartyId,
        partyNumber: data.partyNumber,
        slotNumber: data.slotNumber,
      },
    });

    if (existingSlot) {
      throw new BadRequestException('이미 사용 중인 슬롯입니다.');
    }

    const maxPartyNumber = raidParty.partySize === 8 ? 2 : 1;
    const maxSlotNumber = 4;

    if (data.partyNumber < 1 || data.partyNumber > maxPartyNumber) {
      throw new BadRequestException(
        `partyNumber는 1부터 ${maxPartyNumber}까지 가능합니다.`,
      );
    }

    if (data.slotNumber < 1 || data.slotNumber > maxSlotNumber) {
      throw new BadRequestException('slotNumber는 1부터 4까지 가능합니다.');
    }

    const member = this.raidPartyMemberRepository.create({
      raidPartyId,
      characterId: data.characterId,
      partyNumber: data.partyNumber,
      slotNumber: data.slotNumber,
      positionRole: data.positionRole,
    });

    await this.raidPartyMemberRepository.save(member);

    return this.raidPartyRepository.findOne({
      where: { id: raidPartyId },
      relations: {
        raidInfo: true,
        group: true,
        members: {
          character: true,
        },
      },
    });
  }

  async findRaidPartiesByGroup(requesterUserId: number, groupId: number) {
    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 공격대에 접근할 수 없습니다.');
    }

    const raidParties = await this.raidPartyRepository
      .createQueryBuilder('raidParty')
      .leftJoinAndSelect('raidParty.raidInfo', 'raidInfo')
      .leftJoinAndSelect('raidParty.createdByUser', 'createdByUser')
      .leftJoinAndSelect('raidParty.members', 'members')
      .where('raidParty.groupId = :groupId', { groupId })
      .orderBy('raidInfo.orderNo', 'ASC') // 레이드 순서
      .addOrderBy('raidParty.selectedDifficulty', 'DESC') // 필요 없으면 제거 가능
      .addOrderBy('raidParty.id', 'ASC') // 같은 레이드 안에서는 생성순
      .getMany();

    return raidParties.map((raidParty) => ({
      id: raidParty.id,
      groupId: raidParty.groupId,
      raidInfoId: raidParty.raidInfoId,
      title: raidParty.title,
      partySize: raidParty.partySize,
      selectedDifficulty: raidParty.selectedDifficulty,
      createdByUserId: raidParty.createdByUserId,
      createdByUser: {
        id: raidParty.createdByUser.id,
        username: raidParty.createdByUser.username,
        nickname: raidParty.createdByUser.nickname,
        displayName:
          raidParty.createdByUser.nickname ?? raidParty.createdByUser.username,
      },
      raidInfo: {
        id: raidParty.raidInfo.id,
        raidName: raidParty.raidInfo.raidName,
        partySize: raidParty.raidInfo.partySize,
        orderNo: raidParty.raidInfo.orderNo,
      },
      memberCount: raidParty.members.length,
      createdAt: raidParty.createdAt,
      updatedAt: raidParty.updatedAt,
    }));
  }

  async findRaidPartyDetail(requesterUserId: number, raidPartyId: number) {
    const raidParty = await this.raidPartyRepository.findOne({
      where: { id: raidPartyId },
      relations: {
        group: true,
        raidInfo: true,
        createdByUser: true,
        members: {
          character: {
            user: true,
          },
        },
      },
    });

    if (!raidParty) {
      throw new NotFoundException('공격대 파티를 찾을 수 없습니다.');
    }

    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId: raidParty.groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 공격대에 접근할 수 없습니다.');
    }

    const members = [...raidParty.members].sort((a, b) => {
      if (a.partyNumber !== b.partyNumber) {
        return a.partyNumber - b.partyNumber;
      }
      return a.slotNumber - b.slotNumber;
    });

    return {
      id: raidParty.id,
      groupId: raidParty.groupId,
      title: raidParty.title,
      partySize: raidParty.partySize,
      selectedDifficulty: raidParty.selectedDifficulty,
      createdByUserId: raidParty.createdByUserId,
      createdByUser: {
        id: raidParty.createdByUser.id,
        username: raidParty.createdByUser.username,
        nickname: raidParty.createdByUser.nickname,
        displayName:
          raidParty.createdByUser.nickname ?? raidParty.createdByUser.username,
      },
      raidInfo: {
        id: raidParty.raidInfo.id,
        raidName: raidParty.raidInfo.raidName,
        partySize: raidParty.raidInfo.partySize,
      },
      members: members.map((member) => ({
        id: member.id,
        raidPartyId: member.raidPartyId,
        characterId: member.characterId,
        partyNumber: member.partyNumber,
        slotNumber: member.slotNumber,
        positionRole: member.positionRole,
        character: {
          id: member.character.id,
          characterName: member.character.characterName,
          characterClassName: member.character.characterClassName,
          itemAvgLevel: member.character.itemAvgLevel,
          combatPower: member.character.combatPower,
          partyRole: member.character.partyRole,
          ownerUserId: member.character.userId,
          ownerDisplayName:
            member.character.user.nickname ?? member.character.user.username,
        },
      })),
      createdAt: raidParty.createdAt,
      updatedAt: raidParty.updatedAt,
    };
  }

  async removeRaidPartyMember(
    requesterUserId: number,
    raidPartyId: number,
    memberId: number,
  ) {
    const raidParty = await this.raidPartyRepository.findOne({
      where: { id: raidPartyId },
    });

    if (!raidParty) {
      throw new NotFoundException('공격대 파티를 찾을 수 없습니다.');
    }

    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId: raidParty.groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 공격대에 접근할 수 없습니다.');
    }

    const member = await this.raidPartyMemberRepository.findOne({
      where: {
        id: memberId,
        raidPartyId,
      },
      relations: {
        character: true,
      },
    });

    if (!member) {
      throw new NotFoundException('파티 멤버를 찾을 수 없습니다.');
    }

    await this.raidPartyMemberRepository.remove(member);

    return {
      message: '파티에서 캐릭터가 제거되었습니다.',
      removedMember: {
        id: member.id,
        characterId: member.characterId,
        characterName: member.character.characterName,
      },
    };
  }

  async moveRaidPartyMember(
    requesterUserId: number,
    raidPartyId: number,
    memberId: number,
    data: {
      partyNumber: number;
      slotNumber: number;
      positionRole?: 'DEALER' | 'SUPPORT';
    },
  ) {
    const raidParty = await this.raidPartyRepository.findOne({
      where: { id: raidPartyId },
    });

    if (!raidParty) {
      throw new NotFoundException('공격대 파티를 찾을 수 없습니다.');
    }

    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId: raidParty.groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 공격대에 접근할 수 없습니다.');
    }

    const sourceMember = await this.raidPartyMemberRepository.findOne({
      where: {
        id: memberId,
        raidPartyId,
      },
      relations: {
        character: true,
      },
    });

    if (!sourceMember) {
      throw new NotFoundException('이동할 파티 멤버를 찾을 수 없습니다.');
    }

    const maxPartyNumber = raidParty.partySize === 8 ? 2 : 1;
    const maxSlotNumber = 4;

    if (data.partyNumber < 1 || data.partyNumber > maxPartyNumber) {
      throw new BadRequestException(
        `partyNumber는 1부터 ${maxPartyNumber}까지 가능합니다.`,
      );
    }

    if (data.slotNumber < 1 || data.slotNumber > maxSlotNumber) {
      throw new BadRequestException('slotNumber는 1부터 4까지 가능합니다.');
    }

    // 같은 위치면 role만 변경
    if (
      sourceMember.partyNumber === data.partyNumber &&
      sourceMember.slotNumber === data.slotNumber
    ) {
      if (data.positionRole) {
        sourceMember.positionRole = data.positionRole;
        await this.raidPartyMemberRepository.save(sourceMember);
      }

      return this.findRaidPartyDetail(requesterUserId, raidPartyId);
    }

    const targetMember = await this.raidPartyMemberRepository.findOne({
      where: {
        raidPartyId,
        partyNumber: data.partyNumber,
        slotNumber: data.slotNumber,
      },
    });

    const sourceOldPartyNumber = sourceMember.partyNumber;
    const sourceOldSlotNumber = sourceMember.slotNumber;

    await this.raidPartyMemberRepository.manager.transaction(
      async (manager) => {
        if (targetMember) {
          // 1. target를 임시 위치로 이동
          targetMember.partyNumber = 99;
          targetMember.slotNumber = 99;
          await manager.save(targetMember);

          // 2. source를 target 자리로 이동
          sourceMember.partyNumber = data.partyNumber;
          sourceMember.slotNumber = data.slotNumber;
          if (data.positionRole) {
            sourceMember.positionRole = data.positionRole;
          }
          await manager.save(sourceMember);

          // 3. target을 source 원래 자리로 이동
          targetMember.partyNumber = sourceOldPartyNumber;
          targetMember.slotNumber = sourceOldSlotNumber;
          await manager.save(targetMember);
        } else {
          // 빈 슬롯 이동
          sourceMember.partyNumber = data.partyNumber;
          sourceMember.slotNumber = data.slotNumber;
          if (data.positionRole) {
            sourceMember.positionRole = data.positionRole;
          }
          await manager.save(sourceMember);
        }
      },
    );

    return this.findRaidPartyDetail(requesterUserId, raidPartyId);
  }

  async deleteRaidParty(requesterUserId: number, raidPartyId: number) {
    const raidParty = await this.raidPartyRepository.findOne({
      where: { id: raidPartyId },
      relations: {
        raidInfo: true,
      },
    });

    if (!raidParty) {
      throw new NotFoundException('공격대 파티를 찾을 수 없습니다.');
    }

    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId: raidParty.groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 공격대에 접근할 수 없습니다.');
    }

    await this.raidPartyRepository.remove(raidParty);

    return {
      message: '공격대 파티가 삭제되었습니다.',
      deletedRaidParty: {
        id: raidParty.id,
        title: raidParty.title,
        raidInfoId: raidParty.raidInfoId,
        raidName: raidParty.raidInfo?.raidName ?? null,
      },
    };
  }

  async findAvailableDifficulties(
    requesterUserId: number,
    groupId: number,
    raidInfoId: number,
  ) {
    const membership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: requesterUserId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('해당 공격대에 접근할 수 없습니다.');
    }

    const gateInfos = await this.raidGateInfoRepository.find({
      where: {
        raidInfoId,
      },
      order: {
        orderNo: 'ASC',
      },
    });

    const uniqueDifficulties = [
      ...new Set(gateInfos.map((gate) => gate.difficulty)),
    ].filter(Boolean);

    return uniqueDifficulties.map((difficulty) => ({
      label: difficulty,
      value: difficulty,
    }));
  }
}
