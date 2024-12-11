const express = require("express");
const fs=require("fs");
const fsp=require("fs").promises;
const router = express.Router();
const data=require("../books.json");
const data2=require("../users.json");

const books = data.books;
const users=data2.users;
const path = require("path");
const usersFilePath = path.join(__dirname, "../users.json");

function saveUsers() {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify({ users: users }, null, 2), "utf-8");
        console.log("Users saved successfully!");
    } catch (error) {
        console.error("Error writing to users.json:", error);
    }
}

router.get("/:ISBN", (req, res) => {
    const isbn = req.params.ISBN;
   
    const book = books[isbn];  
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});
router.get("/author/:author", (req, res) => {
    const reqAuthor = req.params.author;

    const filteredBooks = Object.values(books).filter(book => 
        book.author && book.author.toLowerCase() === reqAuthor.toLowerCase()
    );
    console.log(Object.values(books));

    if (filteredBooks.length > 0) {
        res.json(filteredBooks);  
    } else {
        res.status(404).json({ message: "Book(s) not found" });
    }
});
router.get("/title/:title",(req,res) =>{
    const reqTitle=req.params.title;

    const filteredBooks = Object.values(books).filter(book =>
        book.title && book.title.toLowerCase() === reqTitle.toLowerCase()
    );

    if (filteredBooks.length > 0) {
        res.json(filteredBooks);    
    } else {
        res.status(404).json({ message: "Book(s) not found" });
    }
})
router.get("/review/:ISBN", (req,res) =>{
    const reqISBN=req.params.ISBN;
    const book=books[reqISBN];
    console.log(Object.values(books));
    if(book){
        res.json(book.reviews);
    }else{
        res.status(404).json({ message: "Book not found" });
    }

})
router.post("/register", (req,res) =>{
    const username=req.body.username;
    const password=req.body.password;
    users[username]={"password":password};
    res.json("registration successful");
    saveUsers();
    console.log(users);
})
router.post("/login", (req, res) => {
    const givenUsername = req.body.username;
    const givenPass = req.body.password;
    if (!users[givenUsername]) {
        return res.status(404).json("Username not found");
    }

    const regPass = users[givenUsername].password;
    if (regPass === givenPass) {
        res.json("Login successful");
    } else {
        res.status(400).json("Enter correct username or password");
    }
});

router.put("/review/:ISBN", (req, res) => {
    const reqISBN = req.params.ISBN; 
    const reqReview = req.query.review; 

    const book = books[reqISBN];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (!Array.isArray(book.reviews)) {
        book.reviews = []; 
    }
    book.reviews.push(reqReview);
    try {
        fs.writeFileSync(
            path.join(__dirname, "../books.json"),
            JSON.stringify({ books: books }, null, 2),
            "utf-8"
        );
        res.json({ message: "Review added successfully", updatedBook: book });
    } catch (error) {
        console.error("Error writing to books.json:", error);
        res.status(500).json({ message: "Failed to update the book" });
    }
});
router.delete("/review/:ISBN", (req, res) => {
    const reqISBN = req.params.ISBN;
    const book = books[reqISBN]; 
    if (book) {
        if (book.reviews) {
            delete book.reviews;
            res.json({ message: "Review deleted successfully" });
            console.log(book);
        } else {
            res.status(404).json({ message: "No reviews to delete for this book" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
    try {
        fs.writeFileSync(
            path.join(__dirname, "../books.json"),
            JSON.stringify({ books: books }, null, 2),
            "utf-8"
        );
    } catch (error) {
        console.error("Error deleting review to books.json:", error);
        res.status(500).json({ message: "Failed to delete review" });
    }
});
const getBooks = async () => {
    try {
        const filePath = path.join(__dirname, "../books.json");
        const data = await fsp.readFile(filePath, "utf-8");
        const parsedData = JSON.parse(data);
        return parsedData.books;
    } catch (err) {
        console.error("Error reading books.json:", err.message);
        return null;
    }
};

router.get("/allBooks", async (req, res) => {
    try {
        console.log("Getting books...");
        const books = await getBooks();
        if (books) {
            res.json(books);
        } else {
            res.status(404).json({ message: "Books not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});



module.exports = router;
