import { AppDataSource } from "@/database/data-source";
import { Repository, IsNull, Not, SelectQueryBuilder, QueryRunner, In } from "typeorm";
import { Poll, PollStatus, PollType } from "@/entities/poll.entity";
import { PollOption } from "@/entities/poll-option.entity";
import { PollVote } from "@/entities/poll-vote.entity";
import { Employee } from "@/entities/employee.entity";
import { Logger } from "@/services/logger.service";
import { CreatePollDto, UpdatePollDto, AddPollOptionDto, CreatePollVoteDto, PollStatsDto } from "@/dtos/poll.dto";
import { DatabaseService } from "./database.service";

export class PollService {
  private pollRepository: Repository<Poll>;
  private pollOptionRepository: Repository<PollOption>;
  private pollVoteRepository: Repository<PollVote>;
  private employeeRepository: Repository<Employee>;
  private logger: Logger;

  constructor() {
    this.pollRepository = AppDataSource.getRepository(Poll);
    this.pollOptionRepository = AppDataSource.getRepository(PollOption);
    this.pollVoteRepository = AppDataSource.getRepository(PollVote);
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.logger = new Logger("PollService");
  }

  async createPoll(employeeId: number, pollData: CreatePollDto): Promise<Poll | null> {
    let queryRunner: QueryRunner | null = null;

    try {
      console.log("pollData:", pollData);
      queryRunner = await DatabaseService.createTransaction();

      console.log("poll:", employeeId);
      const poll = this.pollRepository.create({
        ...pollData,
        createdById: employeeId,
        createdBy: { id: employeeId },
        options: [],
      });

      if (pollData.startDate && new Date(pollData.startDate) <= new Date()) {
        poll.status = PollStatus.ACTIVE;
      }

      const savedPoll = await queryRunner.manager.save(poll);

      // Step 2: Create and save the PollOption entities with the correct pollId
      console.log(
        "options:",
        pollData.options.map((i) => JSON.stringify(i)),
      );
      const pollOptions = pollData.options.map((option) =>
        this.pollOptionRepository.create({
          text: option.text,
          pollId: savedPoll.id,
          poll: { id: savedPoll.id },
          metadata: option.metadata,
        }),
      );

      console.log("pollOptions:", pollOptions);

      // Save the PollOption entities
      await queryRunner.manager.save(pollOptions);

      // Step 3: Commit the transaction
      await DatabaseService.commitTransaction(queryRunner);

      // Step 4: Fetch and return the saved Poll with its options
      return this.findById(savedPoll.id);
    } catch (error) {
      if (queryRunner) {
        await DatabaseService.rollbackTransaction(queryRunner);
      }
      this.logger.error("Failed to create poll", error);
      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  async findAll(
    options: {
      status?: PollStatus;
      createdById?: number;
      includeOptions?: boolean;
      includeVotes?: boolean;
      employeeId?: number;
      active?: boolean;
      withStats?: boolean;
    } = {},
  ): Promise<Poll[]> {
    const { status, createdById, includeOptions = false, includeVotes = false, employeeId, active = false, withStats = false } = options;

    let queryBuilder = this.pollRepository
      .createQueryBuilder("poll")
      .leftJoinAndSelect("poll.createdBy", "createdBy")
      .leftJoinAndSelect("createdBy.user", "user");

    if (includeOptions) {
      queryBuilder = queryBuilder.leftJoinAndSelect("poll.options", "options");
    }

    if (includeVotes) {
      queryBuilder = queryBuilder.leftJoinAndSelect("poll.votes", "votes").leftJoinAndSelect("votes.employee", "voter");
    }

    if (createdById) {
      queryBuilder = queryBuilder.andWhere("poll.createdById = :createdById", { createdById });
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere("poll.status = :status", { status });
    }

    if (active) {
      const now = new Date();
      queryBuilder = queryBuilder
        .andWhere("poll.status = :activeStatus", { activeStatus: PollStatus.ACTIVE })
        .andWhere("(poll.endDate IS NULL OR poll.endDate > :now)", { now });
    }

    const polls = await queryBuilder.getMany();
    console.log("pollsBackend:", polls);

    if (employeeId) {
      // Get all poll IDs that the employee has voted on
      const votedPollIds = await this.pollVoteRepository
        .createQueryBuilder("vote")
        .select("vote.pollId")
        .where("vote.employeeId = :employeeId", { employeeId })
        .getMany()
        .then((votes) => votes.map((vote) => vote.pollId));

      // Add hasVoted property to each poll
      polls.forEach((poll) => {
        (poll as any).hasVoted = votedPollIds.includes(poll.id);
      });
    }

    if (withStats) {
      return this.addStatsToPolls(polls, options.employeeId);
    }

    return polls;
  }

  async findById(
    id: number,
    options: {
      includeOptions?: boolean;
      includeVotes?: boolean;
      employeeId?: number;
      withStats?: boolean;
    } = {},
  ): Promise<Poll | null> {
    const { includeOptions = true, includeVotes = false, employeeId, withStats = false } = options;

    let queryBuilder = this.pollRepository
      .createQueryBuilder("poll")
      .leftJoinAndSelect("poll.createdBy", "createdBy")
      .leftJoinAndSelect("createdBy.user", "user")
      // .leftJoinAndSelect("poll.department", "department")
      .where("poll.id = :id", { id });

    if (includeOptions) {
      queryBuilder = queryBuilder.leftJoinAndSelect("poll.options", "options");
    }

    if (includeVotes) {
      queryBuilder = queryBuilder
        .leftJoinAndSelect("poll.votes", "votes")
        .leftJoinAndSelect("votes.employee", "voter")
        .leftJoinAndSelect("votes.option", "votedOption");
    }

    if (employeeId) {
      const subQuery = this.pollVoteRepository
        .createQueryBuilder("vote")
        .select("1")
        .where("vote.pollId = poll.id")
        .andWhere("vote.employeeId = :employeeId", { employeeId })
        .limit(1);

      queryBuilder = queryBuilder.addSelect(`EXISTS(${subQuery.getQuery()})`, "hasVoted").setParameters(subQuery.getParameters());
    }

    const poll = await queryBuilder.getOne();

    if (withStats && poll) {
      const polls = await this.addStatsToPolls([poll], employeeId);
      return polls[0];
    }

    return poll;
  }

  async updatePoll(id: number, updateData: UpdatePollDto): Promise<Poll> {
    const poll = await this.pollRepository.findOneBy({ id });

    if (!poll) {
      throw new Error("Poll not found");
    }

    if (updateData.status === PollStatus.ACTIVE && !poll.startDate && !updateData.startDate) {
      updateData.startDate = new Date();
    }

    if (updateData.endDate && poll.startDate && new Date(updateData.endDate) < new Date(poll.startDate)) {
      throw new Error("End date cannot be before start date");
    }

    await this.pollRepository.update(id, updateData);
    return this.findById(id) as Promise<Poll>;
  }

  async deletePoll(id: number): Promise<void> {
    const queryRunner = await DatabaseService.createTransaction();

    try {
      await queryRunner.manager.delete(PollVote, { pollId: id });
      await queryRunner.manager.delete(PollOption, { pollId: id });
      await queryRunner.manager.delete(Poll, { id });

      await DatabaseService.commitTransaction(queryRunner);
    } catch (error) {
      await DatabaseService.rollbackTransaction(queryRunner);
      this.logger.error(`Failed to delete poll ${id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addPollOption(pollId: number, optionData: AddPollOptionDto): Promise<PollOption> {
    const poll = await this.pollRepository.findOneBy({ id: pollId });

    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.status === PollStatus.CLOSED) {
      throw new Error("Cannot add options to a closed poll");
    }

    const option = this.pollOptionRepository.create({
      ...optionData,
      pollId,
    });

    return this.pollOptionRepository.save(option);
  }

  async deletePollOption(pollId: number, optionId: number): Promise<void> {
    const poll = await this.pollRepository.findOneBy({ id: pollId });

    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.status === PollStatus.CLOSED) {
      throw new Error("Cannot delete options from a closed poll");
    }

    const voteCount = await this.pollVoteRepository.count({
      where: { optionId },
    });

    if (voteCount > 0) {
      throw new Error("Cannot delete an option that has votes");
    }

    await this.pollOptionRepository.delete({ id: optionId, pollId });
  }

  async vote(pollId: number, employeeId: number, voteData: CreatePollVoteDto): Promise<PollVote> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ["options"],
    });

    if (!poll) {
      throw new Error("Poll not found");
    }

    // if (poll.status !== PollStatus.ACTIVE) {
    //   throw new Error("This poll is not active for voting");
    // }

    const now = new Date();

    if (poll.endDate && new Date(poll.endDate) < now) {
      await this.pollRepository.update(pollId, { status: PollStatus.CLOSED });
      throw new Error("This poll has ended");
    }

    // Check if poll should be activated
    if (poll.startDate && new Date(poll.startDate) <= now && poll.status === PollStatus.DRAFT) {
      await this.pollRepository.update(pollId, { status: PollStatus.ACTIVE });
      poll.status = PollStatus.ACTIVE;
    }

    // Now check status
    if (poll.status !== PollStatus.ACTIVE) {
      throw new Error("This poll is not active for voting");
    }

    const option = poll.options.find((o) => o.id === voteData.optionId);
    if (!option) {
      throw new Error("Invalid option for this poll");
    }

    if (poll.type === PollType.SINGLE_CHOICE) {
      await this.pollVoteRepository.delete({
        pollId,
        employeeId,
      });
    } else {
      const existingVote = await this.pollVoteRepository.findOne({
        where: {
          pollId,
          employeeId,
          optionId: voteData.optionId,
        },
      });

      if (existingVote) {
        throw new Error("You have already voted for this option");
      }
    }

    const vote = this.pollVoteRepository.create({
      pollId,
      poll: { id: pollId },
      optionId: voteData.optionId,
      employee: { id: employeeId },
      option: { id: voteData.optionId },
      employeeId,
      comment: poll.allowComments ? voteData.comment : undefined,
    });

    return this.pollVoteRepository.save(vote);
  }

  async removeVote(pollId: number, employeeId: number, optionId: number): Promise<void> {
    const poll = await this.pollRepository.findOneBy({ id: pollId });

    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.status !== PollStatus.ACTIVE) {
      throw new Error("This poll is not active for vote modifications");
    }

    await this.pollVoteRepository.delete({
      pollId,
      employeeId,
      optionId,
    });
  }

  async getPollStats(pollId: number, employeeId?: number): Promise<PollStatsDto> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ["options"],
    });

    if (!poll) {
      throw new Error("Poll not found");
    }

    const [totalVotes, totalParticipants] = await Promise.all([
      this.pollVoteRepository.count({ where: { pollId } }),
      this.pollVoteRepository
        .createQueryBuilder("vote")
        .select("COUNT(DISTINCT vote.employeeId)", "count")
        .where("vote.pollId = :pollId", { pollId })
        .getRawOne()
        .then((result) => parseInt(result.count || "0", 10)),
    ]);

    const optionStats = await Promise.all(
      poll.options.map(async (option) => {
        const voteCount = await this.pollVoteRepository.count({
          where: { pollId, optionId: option.id },
        });
        const has = await this.pollVoteRepository.count({
          where: { pollId, employeeId: employeeId },
        });

        return {
          id: option.id,
          text: option.text,
          voteCount,
          has,
          percentage: totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0,
        };
      }),
    );

    const totalEmployees = await this.employeeRepository.count();

    const participationRate = totalEmployees > 0 ? (totalParticipants / totalEmployees) * 100 : 0;

    return {
      totalVotes,
      totalParticipants,
      participationRate,
      options: optionStats,
    };
  }

  async updatePollStatuses(): Promise<void> {
    const now = new Date();

    await this.pollRepository
      .createQueryBuilder()
      .update()
      .set({ status: PollStatus.ACTIVE })
      .where("status = :status", { status: PollStatus.DRAFT })
      .andWhere("startDate IS NOT NULL")
      .andWhere("startDate <= :now", { now: now.toISOString() })
      .execute();

    await this.pollRepository
      .createQueryBuilder()
      .update()
      .set({ status: PollStatus.CLOSED })
      .where("status = :status", { status: PollStatus.ACTIVE })
      .andWhere("endDate IS NOT NULL")
      .andWhere("endDate <= :now", { now: now.toISOString() })
      .execute();
  }

  private async addStatsToPolls(polls: Poll[], employeeId?: number): Promise<Poll[]> {
    if (polls.length === 0) return polls;

    // const pollIds = polls.map((poll) => poll.id);
    const pollIds = polls.map((poll) => poll.id);
    const optionIds = polls.flatMap((poll) => poll.options.map((option) => option.id));

    let userVotedOptionIds: number[] = [];
    if (employeeId) {
      const userVotes = await this.pollVoteRepository.find({
        where: {
          employeeId,
          optionId: In(optionIds),
        },
        select: ["optionId"],
      });
      userVotedOptionIds = userVotes.map((v) => v.optionId);
    }

    // Get vote counts per option
    const [optionVoteCounts, pollVoteCounts, participantCounts] = await Promise.all([
      this.pollVoteRepository
        .createQueryBuilder("vote")
        .select("vote.optionId", "optionId")
        .addSelect("COUNT(*)", "count")
        .where("vote.optionId IN (:...optionIds)", { optionIds })
        .groupBy("vote.optionId")
        .getRawMany(),

      this.pollVoteRepository
        .createQueryBuilder("vote")
        .select("vote.pollId", "pollId")
        .addSelect("COUNT(*)", "count")
        .where("vote.pollId IN (:...pollIds)", { pollIds })
        .groupBy("vote.pollId")
        .getRawMany(),

      this.pollVoteRepository
        .createQueryBuilder("vote")
        .select("vote.pollId", "pollId")
        .addSelect("COUNT(DISTINCT vote.employeeId)", "count")
        .where("vote.pollId IN (:...pollIds)", { pollIds })
        .groupBy("vote.pollId")
        .getRawMany(),
    ]);

    const totalEmployees = await this.employeeRepository.count();

    return polls.map((poll) => {
      const totalVotes = pollVoteCounts.find((v) => v.pollId === poll.id)?.count || 0;
      const participantCount = participantCounts.find((p) => p.pollId === poll.id)?.count || 0;
      // const voteData = voteCounts.find((vc) => vc.vote_pollId === poll.id);
      // const participantData = participantCounts.find((pc) => pc.vote_pollId === poll.id);

      // const voteCount = voteData ? parseInt(voteData.count, 10) : 0;
      // const participantCount = participantData ? parseInt(participantData.count, 10) : 0;

      const optionsWithVotes = poll.options.map((option) => {
        const votes = optionVoteCounts.find((v) => v.optionId === option.id)?.count || 0;
        return {
          ...option,
          voteCount: Number(votes),
          percentage: totalVotes > 0 ? (Number(votes) / Number(totalVotes)) * 100 : 0,
          hasVoted: userVotedOptionIds.includes(option.id),
        };
      });

      const participationRate = totalEmployees > 0 ? (participantCount / totalEmployees) * 100 : 0;

      return {
        // ...poll,
        // voteCount,
        // participationRate,
        ...poll,
        options: optionsWithVotes,
        voteCount: Number(totalVotes),
        participationRate,
      };
    });
  }

  async findByPollIdAndUserId(pollId: number, userId: number): Promise<PollVote | null> {
    return this.pollVoteRepository.findOne({
      where: { pollId, employeeId: userId },
    });
  }
}
