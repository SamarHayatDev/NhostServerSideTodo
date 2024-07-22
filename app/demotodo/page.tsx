import React from "react";
import MoviesFetching from "./MoviesFetching";
import UserStatusCheck from "./userStatusCheck";
import AddMovie from "./addMovies";
import { useState } from "react";

const Demotodo = () => {
  return (
    <>
      <AddMovie />
      <MoviesFetching />
      <UserStatusCheck />
    </>
  );
};

export default Demotodo;
