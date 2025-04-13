"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, CheckCircle, PlayCircle } from "lucide-react";
import MyLearningCard from "@/components/MyLearningPage/MyLearningCard";

export default function MyLearningPage() {
  const [activeTab, setActiveTab] = useState("in-progress");

  const inProgressCourses = [
    {
      id: "1",
      title: "Complete Web Development Bootcamp",
      author: "Jane Smith",
      image: "/placeholder.svg?height=200&width=350",
      category: "Web Development",
      completionPercentage: 75,
      lastAccessed: "2 days ago",
      totalLectures: 42,
      completedLectures: 31,
      estimatedTimeLeft: "5 hours",
    },
    // ...more
  ];

  const completedCourses = [
    {
      id: "3",
      title: "Blockchain Development Masterclass",
      author: "Alex Johnson",
      image: "/placeholder.svg?height=200&width=350",
      category: "Blockchain",
      completionPercentage: 100,
      completionDate: "April 15, 2023",
      totalLectures: 35,
      completedLectures: 35,
      certificateId: "CERT-BDM-1234",
    },
    // ...more
  ];

  const savedCourses = [
    {
      id: "6",
      title: "Data Science with Python",
      author: "Emily Rodriguez",
      image: "/placeholder.svg?height=200&width=350",
      category: "Data Science",
      price: 0.09,
      addedDate: "May 5, 2023",
    },
    // ...more
  ];

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Learning</h1>
            <p className="text-muted-foreground">
              Track your progress and continue learning
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link to="/explore">
              <Button>Find New Courses</Button>
            </Link>
          </div>
        </div>

        <Tabs
          defaultValue="in-progress"
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="mb-8">
            <TabsTrigger value="in-progress" className="flex items-center">
              <PlayCircle className="mr-2 h-4 w-4" />
              In Progress
              <Badge variant="secondary" className="ml-2">
                {inProgressCourses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed
              <Badge variant="secondary" className="ml-2">
                {completedCourses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Saved
              <Badge variant="secondary" className="ml-2">
                {savedCourses.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress">
            <MyLearningCard type="in-progress" data={inProgressCourses} />
          </TabsContent>
          <TabsContent value="completed">
            <MyLearningCard type="completed" data={completedCourses} />
          </TabsContent>
          <TabsContent value="saved">
            <MyLearningCard type="saved" data={savedCourses} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
