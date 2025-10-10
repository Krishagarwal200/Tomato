import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://krish5932n_db_user:N5MWa2jcDy6qh4y4@tomato.7xtvq0o.mongodb.net/food-del"
    )
    .then(() => console.log("DB connected"));
};
