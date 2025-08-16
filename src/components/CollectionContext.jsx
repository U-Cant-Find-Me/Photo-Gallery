"use client";
import React, { createContext, useContext, useState } from 'react';

const CollectionContext = createContext();

export const useCollection = () => useContext(CollectionContext);

export const CollectionProvider = ({ children }) => {
  const [collection, setCollection] = useState([]);

  const addToCollection = (image) => {
    let alreadyExists = false;
    setCollection((prev) => {
      if (prev.some((img) => img.id === image.id && img.source === image.source)) {
        alreadyExists = true;
        return prev;
      }
      return [...prev, image];
    });
    return !alreadyExists;
  };

  const removeFromCollection = (id, source) => {
    setCollection((prev) => prev.filter((img) => !(img.id === id && img.source === source)));
  };

  return (
    <CollectionContext.Provider value={{ collection, addToCollection, removeFromCollection }}>
      {children}
    </CollectionContext.Provider>
  );
};
