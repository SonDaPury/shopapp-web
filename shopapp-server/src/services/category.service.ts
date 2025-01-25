import { Database } from "../configs/database.config";
import { Repository } from "typeorm";
import { Category } from "../models/category.model";

export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor() {
    this.categoryRepository = Database.getDbInstance().getRepository(Category);
  }

  public async getAllCategoriesService(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  public async createCategoryService(
    name: string,
    parentId?: number
  ): Promise<Category> {
    try {
      let parentCategory: Category | null = null;
      if (parentId) {
        parentCategory = await this.categoryRepository.findOne({
          where: {
            id: parentId,
          },
        });

        if (!parentCategory) {
          throw new Error(`Parent category with ID ${parentId} not found`);
        }
      }

      const existedCategory = await this.categoryRepository.findOne({
        where: { name },
      });
      if (existedCategory)
        throw new Error(`Category with name ${name} already exists`);

      const newCategory = this.categoryRepository.create({
        name,
        parent: parentCategory || undefined,
      });

      return await this.categoryRepository.save(newCategory);
    } catch (error: any) {
      throw new Error(`Error creating category: ${error?.message}`);
    }
  }
}
