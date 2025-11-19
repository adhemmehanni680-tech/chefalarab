"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUp, Heart } from "lucide-react";

const categories = [
  "جميع الوصفات",
  "الطبق العربي",
  "مخللات وسلطات",
  "حلويات",
  "مثلجات و مشروبات",
  "احدث الوصفات",
  "الوصفات ألأكثر إعجابا",
];

interface Recipe {
  id: number;
  title: string;
  country: string;
  img: string;
  category: string[];
  description: string;
  ingredients: string[];
  data_box: string[];
  preparation: string[];
}

export default function AddRecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const defaultDataBoxTitles = [
    "وقت التحضير:",
    "وقت الطبخ:",
    "عدد الأشخاص:",
    "الوجبة:",
    "المستوى:",
    "نوع الطبق:"
  ];
  const [dataBoxValues, setDataBoxValues] = useState(
    defaultDataBoxTitles.map(title => ({ title, value: "" }))
  );
  const [preparation, setPreparation] = useState<string[]>([]);
  const [preparationInput, setPreparationInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("جميع الوصفات");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load recipes
  useEffect(() => {
    fetch("/recipes.json")
      .then(res => res.json())
      .then(data => setRecipes(data));
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const resetForm = () => {
    setTitle(""); setCountry(""); setDescription(""); setCategory([]);
    setIngredients([]); setIngredientInput("");
    setPreparation([]); setPreparationInput("");
    setImage(null); setExistingImage(null); setEditId(null);
    setDataBoxValues(defaultDataBoxTitles.map(title => ({ title, value: "" })));
  };

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !country || !description || category.length === 0)
      return showMessage("❌ الرجاء إدخال جميع البيانات!", "error");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("country", country);
    formData.append("description", description);
    formData.append("category", JSON.stringify(category));
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append(
      "data_box",
      JSON.stringify(dataBoxValues.map(item => `${item.title} ${item.value}`))
    );
    formData.append("preparation", JSON.stringify(preparation));
    if (image) formData.append("image", image);
    else if (existingImage) formData.append("img", existingImage);
    if (editId) formData.append("id", editId.toString());
    formData.append("action", editId ? "edit" : "add");

    try {
      const res = await fetch("/api/add-recipe", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || "✅ تمت العملية بنجاح!", "success");
        setRecipes(data.recipes || [...recipes, data.recipe]);
        resetForm();
      } else {
        showMessage(`❌ ${data.error || "حدث خطأ أثناء الإرسال"}`, "error");
      }
    } catch {
      showMessage("❌ حدث خطأ في الاتصال بالسيرفر", "error");
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setTitle(recipe.title); setCountry(recipe.country); setDescription(recipe.description);
    setCategory(recipe.category);
    setIngredients(recipe.ingredients);
    setDataBoxValues(
      recipe.data_box.length
        ? recipe.data_box.map(text => {
            const splitIndex = text.indexOf(":") + 1;
            return { title: text.slice(0, splitIndex), value: text.slice(splitIndex).trim() };
          })
        : defaultDataBoxTitles.map(title => ({ title, value: "" }))
    );
    setPreparation(recipe.preparation);
    setEditId(recipe.id); setImage(null); setExistingImage(recipe.img);
    setIngredientInput(""); setPreparationInput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف الوصفة؟")) return;
    const formData = new FormData();
    formData.append("id", id.toString());
    formData.append("action", "delete");
    const res = await fetch("/api/add-recipe", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setRecipes(data.recipes);
      showMessage("✅ تم حذف الوصفة بنجاح!", "success");
    }
  };

  const toggleFavorite = async (recipe: Recipe) => {
    const formData = new FormData();
    formData.append("action", "toggleFavorite");
    formData.append("id", recipe.id.toString());
    const res = await fetch("/api/add-recipe", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok && data.recipe) {
      setRecipes(prev => prev.map(r => r.id === recipe.id ? data.recipe : r));
    }
  };

  const filteredRecipes = recipes.filter(r => 
    (activeCategory === "جميع الوصفات" || r.category.includes(activeCategory)) &&
    (r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addItem = (value: string, setter: (arr: string[]) => void, array: string[]) => {
    if (!value.trim()) return;
    setter([...array, value.trim()]);
  };
  const removeItem = (index: number, setter: (arr: string[]) => void, array: string[]) => {
    setter(array.filter((_, i) => i !== index));
  };

  return (
    <div className="box-border w-full min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">

      {message && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white text-center z-50 transition-colors ${
          messageType === "success" ? "bg-green-500" : "bg-red-500"
        }`}>{message}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-xl shadow space-y-4 transition-colors">
        <h1 className="text-2xl sm:text-3xl font-semibold text-orange-500 text-center break-words">
          {editId ? "تعديل وصفة" : "إضافة وصفة جديدة"}
        </h1>

        <input placeholder="اسم الوصفة" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
        <input placeholder="البلد" value={country} onChange={e => setCountry(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
        <textarea placeholder="وصف الوصفة" value={description} onChange={e => setDescription(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded resize-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          rows={3} />

        {/* Categories */}
        <div className="border border-gray-300 dark:border-gray-600 p-3 rounded w-full transition-colors">
          <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">اختر التصنيفات:</p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map(cat => (
              <label key={cat} className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <input type="checkbox" value={cat} checked={category.includes(cat)}
                  onChange={e => e.target.checked ? setCategory(prev => [...prev, cat]) : setCategory(prev => prev.filter(c => c !== cat))}
                  className="accent-orange-500" />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">المكونات:</p>
          <div className="flex gap-2 mb-2">
            <input value={ingredientInput} onChange={e => setIngredientInput(e.target.value)}
              placeholder="أضف مكون" className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
            <button type="button" onClick={() => { addItem(ingredientInput, setIngredients, ingredients); setIngredientInput(""); }}
              className="bg-orange-500 text-white px-4 rounded hover:bg-orange-600 transition-colors">إضافة</button>
          </div>
          <ul className="flex flex-wrap gap-2 mb-2">
            {ingredients.map((item, idx) => (
              <li key={idx} className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded flex items-center gap-1">
                {item} <button type="button" onClick={() => removeItem(idx, setIngredients, ingredients)} className="text-red-500 font-bold">×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* DataBox */}
        <div>
          <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">مربعات البيانات:</p>
          <div className="flex flex-col gap-2 mb-2">
            {dataBoxValues.map((item, idx) => (
              <input key={idx} value={item.value} onChange={e => {
                const newValues = [...dataBoxValues];
                newValues[idx].value = e.target.value;
                setDataBoxValues(newValues);
              }}
                placeholder={item.title}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
            ))}
          </div>
        </div>

        {/* Preparation */}
        <div>
          <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">خطوات التحضير:</p>
          <div className="flex gap-2 mb-2">
            <input value={preparationInput} onChange={e => setPreparationInput(e.target.value)}
              placeholder="أضف خطوة" className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
            <button type="button" onClick={() => { addItem(preparationInput, setPreparation, preparation); setPreparationInput(""); }}
              className="bg-orange-500 text-white px-4 rounded hover:bg-orange-600 transition-colors">إضافة</button>
          </div>
          <ul className="flex flex-wrap gap-2 mb-2">
            {preparation.map((item, idx) => (
              <li key={idx} className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded flex items-center gap-1">
                {item} <button type="button" onClick={() => removeItem(idx, setPreparation, preparation)} className="text-red-500 font-bold">×</button>
              </li>
            ))}
          </ul>
        </div>

        {existingImage && !image && (
          <div className="w-full aspect-[16/9] relative mb-3">
            <p className="text-sm mb-1 text-gray-900 dark:text-gray-100">الصورة الحالية:</p>
            <Image src={existingImage} alt="Current Image" fill className="object-cover rounded"  loading="lazy"/>
          </div>
        )}

        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />

        <button className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600 w-full transition-colors">
          {editId ? "تحديث" : "إضافة"}
        </button>
      </form>

      {/* Search & Categories */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-6 mb-6">
        <input type="text" placeholder="ابحث عن وصفة..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500" />
        {categories.map(cat => (
          <button key={cat} onClick={() => { setActiveCategory(cat); setSearchTerm(""); }}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeCategory === cat ? "bg-orange-500 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white dark:bg-[#0f1a25] text-gray-900 dark:text-white p-4 rounded-xl shadow flex flex-col transition-colors">
              <div className="relative w-full h-40 sm:h-44 md:h-48 rounded overflow-hidden">
                <Image src={recipe.img} alt={recipe.title} fill className="object-cover" loading="lazy" />
              </div>

              <div className="mt-2 flex flex-col gap-1 flex-1">
                <h3 className="text-lg font-semibold break-words">{recipe.title}</h3>
                <p className="text-sm break-words">{recipe.country}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300 break-words">{recipe.category.join(", ")}</p>
                <p className="text-sm mt-1 break-words line-clamp-3">{recipe.description}</p>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => handleEdit(recipe)}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm transition-colors">تعديل</button>
                <button onClick={() => handleDelete(recipe.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm transition-colors">حذف</button>
                <button onClick={() => toggleFavorite(recipe)}
                  className="flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm">
                  <Heart size={18} className={`transition-colors ${recipe.category.includes("الوصفات ألأكثر إعجابا") ? "text-orange-500" : "text-gray-400"}`} />
                  المفضلة
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-300 mt-4">
            لا توجد وصفات مطابقة للبحث أو التصنيف الحالي.
          </p>
        )}
      </div>

      {showScrollTop && (
        <button onClick={scrollToTop}
          className="fixed bottom-14 right-6 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-50">
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
