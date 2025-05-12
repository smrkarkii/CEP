import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { BookOpen, Clock, CheckCircle, Award } from "lucide-react";

type InProgressCourse = {
  id: string;
  title: string;
  author: string;
  image: string;
  category: string;
  completionPercentage: number;
  lastAccessed: string;
  totalLectures: number;
  completedLectures: number;
  estimatedTimeLeft: string;
};

type CompletedCourse = {
  id: string;
  title: string;
  author: string;
  image: string;
  category: string;
  completionPercentage: number;
  completionDate: string;
  totalLectures: number;
  completedLectures: number;
  certificateId: string;
};

type SavedCourse = {
  id: string;
  title: string;
  author: string;
  image: string;
  category: string;
  price: number;
  addedDate: string;
};

type CourseType = "in-progress" | "completed" | "saved";

interface MyLearningCardProps {
  type: CourseType;
  data: InProgressCourse[] | CompletedCourse[] | SavedCourse[];
}

const MyLearningCard = ({ type, data }: MyLearningCardProps) => {
  if (type === "in-progress") {
    const courses = data as InProgressCourse[];
    return (
      <div className="grid grid-cols-1 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="flex-1 p-6 flex flex-col">
                <div>
                  <Badge className="mb-2">{course.category}</Badge>
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    by {course.author}
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{course.completionPercentage}%</span>
                    </div>
                    <Progress
                      value={course.completionPercentage}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Last accessed {course.lastAccessed}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {course.completedLectures}/{course.totalLectures} lectures
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>~{course.estimatedTimeLeft} left</span>
                  </div>
                </div>
                <Link to={`/course/${course.id}`} className="mt-4">
                  <Button>Continue</Button>
                </Link>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "completed") {
    const courses = data as CompletedCourse[];
    return (
      <div className="grid grid-cols-1 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Badge className="bg-green-600 text-white px-3 py-1 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </Badge>
                </div>
              </div>
              <CardContent className="flex-1 p-6">
                <Badge className="mb-2">{course.category}</Badge>
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  by {course.author}
                </p>
                <div className="mb-4 flex justify-between text-sm">
                  <span>Completed</span>
                  <span>{course.completionPercentage}%</span>
                </div>
                <Progress
                  value={course.completionPercentage}
                  className="h-2 bg-green-100 dark:bg-green-900"
                />
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Completed on {course.completionDate}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                    {course.completedLectures}/{course.totalLectures} lectures
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link to={`/certificate/${course.certificateId}`}>
                    <Button variant="outline">
                      <Award className="h-4 w-4 mr-2" /> Certificate
                    </Button>
                  </Link>
                  <Link to={`/course/${course.id}`}>
                    <Button variant="outline">Review</Button>
                  </Link>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "saved") {
    const courses = data as SavedCourse[];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 right-2 bg-slate-800/80 hover:bg-slate-800/80">
                {course.category}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-1">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                by {course.author}
              </p>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Added on {course.addedDate}</span>
                <span className="font-bold">{course.price} ETH</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="w-full">Enroll Now</Button>
                <Button variant="outline" size="icon">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return null;
};

export default MyLearningCard;
