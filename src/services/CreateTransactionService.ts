import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryReporitory = getRepository(Category);

    let createdCategory = await categoryReporitory.findOne({
      where: { title: category },
    });
    if (!createdCategory) {
      createdCategory = categoryReporitory.create({ title: category });
      await categoryReporitory.save(createdCategory);
    }
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (balance.total < value) {
        throw new AppError('There is no valid balance for this transaction');
      }
    }
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: createdCategory,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
