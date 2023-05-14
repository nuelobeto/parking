import * as React from "react";
import { PARKING_CAPACITY } from "../config";
import { ParkingContextType, ParkingSpace } from "./types";

export const ParkingContext = React.createContext<
  ParkingContextType | undefined
>(undefined);

function initParking(): ParkingSpace[] {
  return [...Array(PARKING_CAPACITY)].map((_, idx: number) => ({
    spaceNumber: idx + 1,
    ticket: null,
  }));
}

function generateBarcode(): string {
  return String(
    Math.floor(Math.random() * 9000000000000000) + 1000000000000000
  );
}

function getPackings(): ParkingSpace[] {
  return JSON.parse(localStorage.getItem("parkingSpaces") || "[]");
}

function getAllTickets(): any[] {
  return JSON.parse(localStorage.getItem("allTickets") || "[]");
}

export function ParkingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [parkingSpaces, setParkingSpaces] = React.useState(initParking());
  const [allTickets, setAllTickets] = React.useState<any[]>([]);

  // Initialize the parking spaces with occupiedSpaces data from local storage
  React.useEffect(() => {
    const packingSpacesLocal = getPackings();
    const allTicketsLocal = getAllTickets();
    setParkingSpaces(
      packingSpacesLocal.length ? packingSpacesLocal : parkingSpaces
    );
    setAllTickets(allTicketsLocal);
  }, []);

  const updateParkingSpace = (spaceNumber: number, ticket: string | null) => {
    setParkingSpaces((prev: ParkingSpace[]) => {(prev.map((space) =>
      space.spaceNumber === spaceNumber ? { ...space, ticket } : space
    )
    localStorage.setItem("parkingSpaces", JSON.stringify(parkingSpaces))}
    );
    console.log({ spaceNumber }, { ticket });

    
  };

  const park = async (spaceNumber: number) => {
    const ticket = generateBarcode();
    const p = new Promise((resolve) =>
      resolve(updateParkingSpace(spaceNumber, ticket))
    );
    return await p;
  };

  const leave = async (spaceNumber: number) => {
    const p = new Promise((resolve) =>
      resolve(updateParkingSpace(spaceNumber, null))
    );
    return await p;
  };

  const initialState: ParkingContextType = {
    parkingSpaces,
    park,
    leave,
  };

  return (
    <ParkingContext.Provider value={initialState}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking(): ParkingContextType {
  const context = React.useContext(ParkingContext);
  if (context === undefined) {
    throw new Error("useParking called outside context.");
  }

  return context;
}
