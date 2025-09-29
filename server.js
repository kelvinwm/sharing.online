const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4400;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    const response = await axios.post(
      "https://dev.quiltreader.com/adminportal/api/getbookdetails",
      { slug }
    );

    const book = response.data?.data?.bookDetails?.[0];

    if (!book) {
      return res.status(404).send("Book not found");
    }

    res.render("book", { book });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching book details");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
