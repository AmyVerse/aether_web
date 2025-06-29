"use client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  sender?: string;
  unreadCount: number;
  avatar?: string;
}

interface GroupChatsProps {
  className?: string;
}

export default function GroupChats({ className }: GroupChatsProps) {
  // Dummy data - in real app, this would come from props or API
  const chats: Chat[] = [
    {
      id: "1",
      name: "Teacher's Group",
      lastMessage: "Who can replace me on Wednesday?",
      sender: "Donna Clapton",
      unreadCount: 3,
    },
    {
      id: "2",
      name: "Class 3A",
      lastMessage: "Composition-task.pdf",
      sender: "You",
      unreadCount: 0,
    },
    {
      id: "3",
      name: "Class 3B",
      lastMessage: "Where can I find the assignment details?",
      sender: "Cody Dodson",
      unreadCount: 2,
    },
    {
      id: "4",
      name: "Math Department",
      lastMessage: "Meeting scheduled for Friday",
      sender: "Dr. Smith",
      unreadCount: 1,
    },
  ];

  return (
    <Card className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Group Chats</h3>
        <Button variant="ghost" size="sm" className="text-blue-600">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <Avatar
              src={chat.avatar}
              fallback={chat.name.charAt(0)}
              size="md"
              className="bg-blue-100 text-blue-600"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700 text-sm truncate">
                  {chat.name}
                </h4>
                {chat.unreadCount > 0 && (
                  <Badge variant="primary" className="ml-2">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {chat.sender && chat.sender !== "You" && (
                  <span className="font-medium">{chat.sender}: </span>
                )}
                {chat.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
