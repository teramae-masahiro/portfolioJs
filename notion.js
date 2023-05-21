import { createElImg, createElDummyImg } from "./news";
import gsap from "gsap";
import dummyImg from "../../images/cloud.jpg";

const fetchBlogList = async (keyword) => {
  const queries = keyword ? `?keyword=${keyword}` : "";
  const response = await fetch(`/fetch-data.php${queries}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    const data = await response.json();
    return data.contents;
  }
};

const fetchCategories = async () => {
  const response = await fetch("/fetch-data.php");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    const data = await response.json();
    return data.contents;
  }
};

const createCategoryButtons = async () => {
  const categories = await fetchCategories();
  const fragment = document.createDocumentFragment();
  const container = document.getElementById('category-buttons');

  let categoryMap = new Map();
  categories.forEach(category => {
    categoryMap.set(category.category.id, category.category.name);
  });

  categoryMap.forEach((name, id) => {
    const button = document.createElement('button');
    button.textContent = name;
    button.dataset.categoryId = id;
    button.classList.add('p-blog__category-button');
    fragment.appendChild(button);
  });
  container.appendChild(fragment);
  document.querySelectorAll(".p-blog__category-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const loadingIndicator = document.createElement("div");
      loadingIndicator.textContent = "Loading...";
      loadingIndicator.id = "loading-indicator";
      document.body.appendChild(loadingIndicator);
      const categoryId = button.dataset.categoryId;
      await addBlogListItems(categoryId);
      document.body.removeChild(loadingIndicator);
    });
  });
};
createCategoryButtons();

const createBlogListItems = (blogList) => {
  const fragment = document.createDocumentFragment();
  blogList.slice(0, 3).forEach((blog) => {
    const li = document.createElement("li");
    li.classList.add("p-blog__item");
    li.innerHTML = blog.eyecatch?.url ? createElImg(blog) : createElDummyImg(blog, dummyImg);
    fragment.appendChild(li);
  });
  const ul = document.createElement("ul");
  ul.classList.add("p-blog__list");
  ul.appendChild(fragment);
  return ul;
};
const searchBlog = async () => {
  const form = document.getElementById("form");
  const searchButton = document.getElementById("search-button");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    searchButton.innerHTML = "...検索中";

    const formData = new FormData(form);
    const keyword = formData.get("keyword");
    await addBlogListItems(keyword);
    form.reset();
    searchButton.innerHTML = "検索";
  });
};

const addBlogListItems = async (keyword) => {
  const blogList = await fetchBlogList(keyword);
  if (blogList.length === 0) {
    const target = document.querySelector(".p-blog__list");
    target.innerHTML = "<p>該当する記事はありません<br>最新記事は空白で送信してください</p>";
    return;
  }
  const blogListHTML = createBlogListItems(blogList);

  const target = document.querySelector(".p-blog__list");
  if (!target) {
    console.error("Target element not found");
    return;
  }
  target.parentNode.replaceChild(blogListHTML, target);

  const blogTitles = document.querySelectorAll(".p-blog__title-wrapper");
  const blogContents = document.querySelectorAll(".p-blog__content-wrapper");

  if (!blogTitles || !blogContents) {
    console.error("Blog titles or contents not found.");
    return;
  }

  gsap.set(blogContents, {
    autoAlpha: 0,
    height: 0,
  });

  if (blogTitles.length > 0 && blogContents.length > 0) {
    blogTitles.forEach((blogTitle) => {
      blogTitle.addEventListener("click", () => {
        const targetElement = blogTitle.nextElementSibling;
        const openBlog = targetElement.classList.contains("contentOpen");
        if (!targetElement) {
          console.error("Target element not found ");
          return;
        }
        targetElement.classList.toggle("contentOpen");
        const rootStyles = getComputedStyle(document.documentElement);
        const lightGray = rootStyles.getPropertyValue("--lightGray");
        let tl = gsap.timeline();

        tl.to(blogTitle, {
          duration: 0.1,
          ease: "ease.inOut",
          backgroundColor: !openBlog ? lightGray : "white",
        })
          .to(blogTitle.nextElementSibling, {
            duration: 0.3,
            ease: "power4.inOut",
            height: openBlog ? 0 : "auto",
            padding: !openBlog ? "20px" : "0",
          })
          .to(blogTitle.nextElementSibling, {
            duration: 0.01,
            ease: "ease.inOut",
            autoAlpha: openBlog ? 0 : 1,
          });
      });
    });
  } else {
    console.error("Blog titles or contents not found.");
  }
};
const target = document.querySelector(".p-blog__list");
if (!target) {
  console.error("Target element not found.");
} else {
  addBlogListItems();
  searchBlog();
}

document.querySelectorAll(".category-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const categoryId = button.dataset.categoryId;
    await addBlogListItems(categoryId);
  });
});
