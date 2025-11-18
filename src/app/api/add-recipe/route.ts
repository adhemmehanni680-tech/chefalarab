import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

// تحديد ملف JSON
const filePath = path.join(process.cwd(), "public/recipes.json");
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");

// تحويل الحقول النصية إلى مصفوفات
function parseListField(value: unknown): string[] {
  if (!value) return [];
  const s = String(value).trim();
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (typeof parsed === "string") return [parsed];
  } catch {}
  return s
    .split(/\r?\n|,/)
    .map((v) => v.trim().replace(/^"+|"+$/g, ""))
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const action = formData.get("action")?.toString();
    const recipes: any[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // إضافة وصفة
    if (action === "add") {
      const title = formData.get("title")?.toString();
      const country = formData.get("country")?.toString();
      const description = formData.get("description")?.toString();
      const imageFile = formData.get("image") as File | null;

      const category = parseListField(formData.get("category"));
      const ingredients = parseListField(formData.get("ingredients"));
      const data_box = parseListField(formData.get("data_box"));
      const preparation = parseListField(formData.get("preparation"));

      if (!title || !country || !description || category.length === 0 || !imageFile) {
        return NextResponse.json({ error: "الرجاء إدخال جميع البيانات!" }, { status: 400 });
      }

      // حفظ الصورة
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const arrayBuffer = await imageFile.arrayBuffer();
      const imagePath = path.join(uploadDir, `${Date.now()}-${imageFile.name}`);
      fs.writeFileSync(imagePath, new Uint8Array(arrayBuffer));
      const imageUrl = `/uploads/${path.basename(imagePath)}`;

      const newRecipe = {
        id: recipes.length ? Math.max(...recipes.map((r) => r.id)) + 1 : 1,
        title,
        country,
        img: imageUrl,
        category,
        description,
        ingredients,
        data_box,
        preparation,
      };

      recipes.push(newRecipe);
      fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2), "utf-8");

      return NextResponse.json({ message: "✅ تمت إضافة الوصفة بنجاح!", recipe: newRecipe });
    }

    // تعديل وصفة
    if (action === "edit") {
      const id = Number(formData.get("id"));
      const title = formData.get("title")?.toString();
      const country = formData.get("country")?.toString();
      const description = formData.get("description")?.toString();
      let img = formData.get("img")?.toString() || "";

      const category = parseListField(formData.get("category"));
      const ingredients = parseListField(formData.get("ingredients"));
      const data_box = parseListField(formData.get("data_box"));
      const preparation = parseListField(formData.get("preparation"));

      const imageFile = formData.get("image") as File | null;
      if (imageFile) {
        const uploadDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const arrayBuffer = await imageFile.arrayBuffer();
        const imagePath = path.join(uploadDir, `${Date.now()}-${imageFile.name}`);
        fs.writeFileSync(imagePath, new Uint8Array(arrayBuffer));
        img = `/uploads/${path.basename(imagePath)}`;
      }

      const updatedRecipes = recipes.map((r) =>
        r.id === id
          ? { id, title, country, img, category, description, ingredients, data_box, preparation }
          : r
      );

      fs.writeFileSync(filePath, JSON.stringify(updatedRecipes, null, 2), "utf-8");
      return NextResponse.json({ message: "✅ تم تعديل الوصفة بنجاح!", recipes: updatedRecipes });
    }

    // حذف وصفة
    if (action === "delete") {
      const id = Number(formData.get("id"));
      const updatedRecipes = recipes.filter((r) => r.id !== id);
      fs.writeFileSync(filePath, JSON.stringify(updatedRecipes, null, 2), "utf-8");
      return NextResponse.json({ message: "✅ تم حذف الوصفة بنجاح!", recipes: updatedRecipes });
    }

    // toggle المفضلة
    if (action === "toggleFavorite") {
      const id = Number(formData.get("id"));
      const updatedRecipes = recipes.map((r) => {
        if (r.id === id) {
          const hasFavorite = r.category.includes("الوصفات ألأكثر إعجابا");
          if (hasFavorite) {
            r.category = r.category.filter((c: string) => c !== "الوصفات ألأكثر إعجابا");
          } else {
            r.category.push("الوصفات ألأكثر إعجابا");
          }
        }
        return r;
      });
      fs.writeFileSync(filePath, JSON.stringify(updatedRecipes, null, 2), "utf-8");
      const updatedRecipe = updatedRecipes.find(r => r.id === id);
      return NextResponse.json({ message: "✅ تم تحديث المفضلة!", recipe: updatedRecipe });
    }

    return NextResponse.json({ error: "❌ حدث خطأ غير معروف" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "❌ حدث خطأ أثناء العملية" }, { status: 500 });
  }
}
