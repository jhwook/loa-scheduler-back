import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartyGroupInvite } from './entities/party-group-invite.entity';
import { PartyGroup } from './entities/party-group.entity';
import { PartyGroupMember } from './entities/party-group-member.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PartyGroupInviteService {
  constructor(
    @InjectRepository(PartyGroupInvite)
    private readonly partyGroupInviteRepository: Repository<PartyGroupInvite>,

    @InjectRepository(PartyGroup)
    private readonly partyGroupRepository: Repository<PartyGroup>,

    @InjectRepository(PartyGroupMember)
    private readonly partyGroupMemberRepository: Repository<PartyGroupMember>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createInvite(
    groupId: number,
    requesterUserId: number,
    nickname: string,
    message?: string,
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
      throw new ForbiddenException('초대할 권한이 없습니다.');
    }

    const group = await this.partyGroupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다.');
    }

    const targetUser = await this.usersRepository.findOne({
      where: { nickname },
    });

    if (!targetUser) {
      throw new NotFoundException('해당 닉네임의 유저를 찾을 수 없습니다.');
    }

    if (targetUser.id === requesterUserId) {
      throw new BadRequestException('자기 자신은 초대할 수 없습니다.');
    }

    const existingMember = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId,
        userId: targetUser.id,
      },
    });

    if (existingMember) {
      throw new BadRequestException('이미 그룹에 속한 유저입니다.');
    }

    const pendingInvite = await this.partyGroupInviteRepository.findOne({
      where: {
        groupId,
        invitedUserId: targetUser.id,
        status: 'PENDING',
      },
    });

    if (pendingInvite) {
      throw new BadRequestException('이미 대기 중인 초대가 있습니다.');
    }

    const invite = this.partyGroupInviteRepository.create({
      groupId,
      invitedUserId: targetUser.id,
      invitedByUserId: requesterUserId,
      status: 'PENDING',
      message: message ?? null,
    });

    const savedInvite = await this.partyGroupInviteRepository.save(invite);

    return this.partyGroupInviteRepository.findOne({
      where: { id: savedInvite.id },
      relations: {
        group: true,
        invitedUser: true,
        invitedByUser: true,
      },
    });
  }

  async findReceivedInvites(userId: number) {
    return this.partyGroupInviteRepository.find({
      where: {
        invitedUserId: userId,
        status: 'PENDING',
      },
      relations: {
        group: true,
        invitedByUser: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findSentInvites(userId: number) {
    const invites = await this.partyGroupInviteRepository.find({
      where: {
        invitedByUserId: userId,
      },
      relations: {
        group: true,
        invitedUser: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return invites.map((invite) => ({
      id: invite.id,
      status: invite.status,
      message: invite.message,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
      group: {
        id: invite.group?.id,
        name: invite.group?.name,
        description: invite.group?.description,
      },
      invitedUser: {
        id: invite.invitedUser?.id,
        username: invite.invitedUser?.username,
        nickname: invite.invitedUser?.nickname,
        displayName:
          invite.invitedUser?.nickname ?? invite.invitedUser?.username,
      },
    }));
  }

  async acceptInvite(inviteId: number, userId: number) {
    const invite = await this.partyGroupInviteRepository.findOne({
      where: { id: inviteId },
      relations: {
        group: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('초대를 찾을 수 없습니다.');
    }

    if (invite.invitedUserId !== userId) {
      throw new ForbiddenException('해당 초대에 접근할 수 없습니다.');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 초대입니다.');
    }

    const existingMember = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId: invite.groupId,
        userId,
      },
    });

    if (existingMember) {
      invite.status = 'ACCEPTED';
      await this.partyGroupInviteRepository.save(invite);

      return {
        message: '이미 그룹 멤버입니다.',
        invite,
      };
    }

    const member = this.partyGroupMemberRepository.create({
      groupId: invite.groupId,
      userId,
      role: 'MEMBER',
      nickname: invite.invitedUser?.nickname,
    });

    await this.partyGroupMemberRepository.save(member);

    invite.status = 'ACCEPTED';
    await this.partyGroupInviteRepository.save(invite);

    return {
      message: '그룹 초대를 수락했습니다.',
      inviteId: invite.id,
      groupId: invite.groupId,
    };
  }

  async rejectInvite(inviteId: number, userId: number) {
    const invite = await this.partyGroupInviteRepository.findOne({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException('초대를 찾을 수 없습니다.');
    }

    if (invite.invitedUserId !== userId) {
      throw new ForbiddenException('해당 초대에 접근할 수 없습니다.');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 초대입니다.');
    }

    invite.status = 'REJECTED';
    await this.partyGroupInviteRepository.save(invite);

    return {
      message: '그룹 초대를 거절했습니다.',
      inviteId: invite.id,
    };
  }

  async cancelInvite(inviteId: number, requesterUserId: number) {
    const invite = await this.partyGroupInviteRepository.findOne({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException('초대를 찾을 수 없습니다.');
    }

    const requesterMembership = await this.partyGroupMemberRepository.findOne({
      where: {
        groupId: invite.groupId,
        userId: requesterUserId,
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('해당 그룹에 접근할 수 없습니다.');
    }

    if (
      invite.invitedByUserId !== requesterUserId &&
      !['OWNER', 'ADMIN'].includes(requesterMembership.role)
    ) {
      throw new ForbiddenException('초대를 취소할 권한이 없습니다.');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 초대입니다.');
    }

    invite.status = 'CANCELED';
    await this.partyGroupInviteRepository.save(invite);

    return {
      message: '초대가 취소되었습니다.',
      inviteId: invite.id,
    };
  }
}
