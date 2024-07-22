"use client";
import React, { useEffect, useState } from "react";
import { useSubscription, gql } from "@apollo/client";

const USER_STATUS_SUBSCRIPTION = gql`
  subscription GetUsers {
    users {
      lastSeen
    }
  }
`;

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

const isOnline = (lastSeen: string) => {
  const lastSeenTime = new Date(lastSeen).getTime();
  const currentTime = Date.now();
  const difference = (currentTime - lastSeenTime) / 1000 / 60; // difference in minutes
  return difference <= 1;
};

const UserStatusCheck: React.FC = () => {
  const { loading, error, data } = useSubscription(USER_STATUS_SUBSCRIPTION);
  const [lastSeenTimes, setLastSeenTimes] = useState<{ lastSeen: string }[]>(
    []
  );

  useEffect(() => {
    if (data && data.users) {
      setLastSeenTimes(data.users);
    }
  }, [data]);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error fetching users: {error.message}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Users Last Seen</h2>
      <ul className=" flex gap-3">
        {lastSeenTimes.map((user, index) => (
          <li key={index} className="px-3 py-2 bg-green-50">
            {isOnline(user.lastSeen) ? (
              <span className="text-green-500 font-bold">Online</span>
            ) : (
              <>
                Last seen:{" "}
                <span className="font-mono">{formatTime(user.lastSeen)}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserStatusCheck;
