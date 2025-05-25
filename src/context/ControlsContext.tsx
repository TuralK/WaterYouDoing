import React, { createContext, useContext, useState } from 'react';

type ControlsState = {
  watering: boolean;
  heating: boolean;
  cooling: boolean;
};

type ControlsContextType = {
  controls: ControlsState;
  setControls: React.Dispatch<React.SetStateAction<ControlsState>>;
};

const ControlsContext = createContext<ControlsContextType>({
  controls: { watering: false, heating: false, cooling: false },
  setControls: () => {},
});

export const ControlsProvider = ({ children }: { children: React.ReactNode }) => {
  const [controls, setControls] = useState<ControlsState>({
    watering: false,
    heating: false,
    cooling: false,
  });

  return (
    <ControlsContext.Provider value={{ controls, setControls }}>
      {children}
    </ControlsContext.Provider>
  );
};

export const useControls = () => useContext(ControlsContext);