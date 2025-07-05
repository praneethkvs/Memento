import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarHeart, Gift, Bell, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-4 bg-[#5abff2]">
              <CalendarHeart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-dark-grey">Memento</h1>
              <p className="text-lg text-gray-600">Remember what matters!</p>
            </div>
          </div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Never miss another birthday, anniversary, or special moment. Keep track of all the important dates 
            in your life with beautiful reminders and personalized notes.
          </p>
          <Button
            onClick={() => window.location.href = '/api/login'}
            className="text-white hover:bg-sky-blue/90 text-lg px-8 py-3 h-auto bg-[#5abff2e6]"
          >
            Sign in to Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#5abff2]">
                <CalendarHeart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-dark-grey mb-2">Track Special Dates</h3>
              <p className="text-gray-600">
                Birthdays, anniversaries, and other important events all in one place.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#5abff2]">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-dark-grey mb-2">Smart Reminders</h3>
              <p className="text-gray-600">
                Get notified days, weeks, or months before important dates.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#5abff2]">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-dark-grey mb-2">Personal Notes</h3>
              <p className="text-gray-600">
                Add gift ideas, preferences, and special notes for each person.
              </p>
            </CardContent>
          </Card>
        </div>

        
      </div>
    </div>
  );
}