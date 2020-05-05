import { isUuid } from 'uuidv4';
import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();
  return response.status(200).json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const Createdtransaction = new CreateTransactionService();
  const transaction = await Createdtransaction.execute({
    title,
    value,
    type,
    category,
  });
  return response.status(200).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  if (!isUuid(id)) {
    throw new AppError('This id is invalid', 400);
  }
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);
  return response
    .status(200)
    .json({ message: `transaction with ID ${id} was deleted` });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    const transactionsPathFile = request.file.path;
    const importTransactionsService = new ImportTransactionsService();
    const transactionsAdded = await importTransactionsService.execute({
      transactionsPathFile,
    });

    return response.status(200).json(transactionsAdded);
  },
);

export default transactionsRouter;
