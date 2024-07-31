'use client'

import { useSearchParams } from "next/navigation";

export const AttemptPath = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const path = searchParams.get("path");
  return (
    <div>
      <p>
        {message} : /{path}
      </p>
    </div>
  );
};
