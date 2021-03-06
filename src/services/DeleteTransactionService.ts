import { getCustomRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transaction = await transactionRepository.findOne(id);
    if (!transaction) {
      throw new AppError('This is an invalid ID');
    }
    // deletar a transação retornada pela pesquisa.
    await transactionRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
