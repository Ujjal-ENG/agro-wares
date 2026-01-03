import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { Category } from "@/types/ecommerce";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/category/${category.slug}`}>
      <Card className="group relative h-48 overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white">{category.name}</h3>
        </div>
      </Card>
    </Link>
  );
}
