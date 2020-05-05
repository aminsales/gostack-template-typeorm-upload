import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Transaction';

@EntityRepository(Category)
class CategoryRepository extends Repository<Category> {}

export default CategoryRepository;
