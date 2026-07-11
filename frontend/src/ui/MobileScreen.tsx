import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function MobileScreen({ children }: Props) {
  return (
    <div className="px-4 py-5 max-w-md mx-auto md:max-w-2xl md:px-6 md:py-6">
      {children}
    </div>
  );
}
