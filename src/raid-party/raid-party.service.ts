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
  ) {}

  async createRaidParty(
    requesterUserId: number,
    data: {
      groupId: number;
      raidInfoId: number;
      title?: string;
      partySize: number;
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

    if (![4, 8].includes(data.partySize)) {
      throw new BadRequestException('partySize는 4 또는 8만 가능합니다.');
    }

    const raidParty = this.raidPartyRepository.create({
      groupId: data.groupId,
      raidInfoId: data.raidInfoId,
      title: data.title ?? null,
      partySize: data.partySize,
      status: 'DRAFT',
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
}
