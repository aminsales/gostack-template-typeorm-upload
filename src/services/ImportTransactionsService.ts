import { getCustomRepository, getRepository, In } from 'typeorm';
import fs from 'fs';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  transactionsPathFile: string;
}
interface DTOTransaction {
  title: string;
  type: 'outcome' | 'income';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ transactionsPathFile }: Request): Promise<Transaction[]> {
    const categories: string[] = [];
    const loadedDataFile = fs.readFileSync(transactionsPathFile, 'utf8');
    const [, ...loadedData] = loadedDataFile.split(/\n/);
    const transactionsLoadedData: DTOTransaction[] = [];
    loadedData.map(el => {
      let rTransaction: DTOTransaction = {
        title: '',
        type: 'income',
        value: 0,
        category: '',
      };
      if (el !== '') {
        const [title, type, value, category] = el.split(/\s*,\s*/);
        if (type !== 'income' && type !== 'outcome') {
          throw new AppError(`Data Type invalid.`);
        }
        rTransaction = {
          title,
          type,
          value: Number(value),
          category,
        };
        categories.push(category);
        transactionsLoadedData.push(rTransaction);
      }
    });

    const transactionsRepository = getCustomRepository(TransactionRepository);
    const existentCategories = await getRepository(Category).find({
      where: { title: In(categories) },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const categoriesRepository = getRepository(Category);
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactionsLoadedData.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
