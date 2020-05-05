import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const balance = transactions.reduce(
      (rObj, transaction) => {
        const rBalance = rObj;
        if (transaction.type === 'income') {
          rBalance.income += transaction.value;
          rBalance.total += transaction.value;
        }
        if (transaction.type === 'outcome') {
          rBalance.outcome += transaction.value;
          rBalance.total -= transaction.value;
        }
        return rBalance;
      },
      { income: 0, outcome: 0, total: 0 },
    );
    return balance;
  }
}

export default TransactionsRepository;
