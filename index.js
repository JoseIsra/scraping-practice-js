const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function initScraper() {
  const { data } = await axios.get(
    "https://www.popcorn.org/Recipes/All-Recipes"
  );

  const $ = cheerio.load(data, null, false);
  const recipes = [];
  $(".article_card").each((index, element) => {
    const $element = $(element);
    const titleLink = $element.find("a.article_title_link");
    const image_url = $element.find("img").first().attr("src");
    recipes.push({
      title: titleLink.text().trim(),
      url: titleLink.attr("href"),
      image_url: `https://popcorn.org${image_url}`,
    });
  });
  fs.writeFileSync("recipes.json", JSON.stringify(recipes), "utf-8");

  await recipes.reduce(async (promise, recipe) => {
    try {
      await promise;
      // make a request to each recipe
      console.log("GETTING RECETA🚀", recipe.title);
      const { data: page_data } = await axios.get(recipe.url);
      const $page = cheerio.load(page_data);
      const $descriptionWrapper = $page(".eds_news_module_427");
      const outerContainer = $($descriptionWrapper.find("div").first());
      const titleRecipe = outerContainer.find("h1").text();
      const recipeDescription = $(outerContainer.find("p")[1]).text();

      const $recipesDetails = $page(".recipe_details");
      const ingredients = [];
      $recipesDetails.find("ul li").each((index, element) => {
        ingredients.push($(element).text().trim());
      });
      const directions = [];
      $recipesDetails.find("ol li").each((index, element) => {
        directions.push($(element).text().trim());
      });
      const nutrionsFactsText = $($recipesDetails.find(".six.columns")[1]);
      const nutritionFacts = nutrionsFactsText.find("p").text().split("\n");

      recipe.titleRecipe = titleRecipe;
      recipe.recipeDescription = recipeDescription;
      recipe.ingredients = ingredients;
      recipe.directions = directions;
      recipe.nutritionFacts = nutritionFacts;
      fs.writeFileSync(
        "recipes.json",
        JSON.stringify(recipes, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("ERROR al obtener receta 💥", recipe.title, error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }, Promise.resolve());
  fs.writeFileSync("recipes.json", JSON.stringify(recipes, null, 2), "utf-8");
}

initScraper();
