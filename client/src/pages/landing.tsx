import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarHeart, Gift, Bell, Users, Sparkles, MessageCircle, Wand2, Clock, Lightbulb } from "lucide-react";

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
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-4">
            Never miss another birthday, anniversary, or special moment. Keep track of all the important dates 
            in your life with smart reminders and AI-powered personalized messages.
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-1 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              NEW: AI Message Generator
            </Badge>
          </div>
          <Button
            onClick={() => window.location.href = '/api/login'}
            className="text-white hover:bg-sky-blue/90 text-lg px-8 py-3 h-auto bg-[#5abff2e6]"
          >
            Sign in to Get Started
          </Button>
        </div>

        {/* AI Feature Spotlight */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-dark-grey mb-4">AI-Powered Message Generator</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
                Never struggle with what to say again. Our AI creates personalized birthday wishes, 
                anniversary messages, and special occasion greetings tailored to your relationship and tone preferences.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <Badge variant="outline" className="bg-white/50">🎂 Birthday Messages</Badge>
                <Badge variant="outline" className="bg-white/50">💝 Anniversary Wishes</Badge>
                <Badge variant="outline" className="bg-white/50">🎉 Special Occasions</Badge>
                <Badge variant="outline" className="bg-white/50">📝 Custom Tone & Length</Badge>
              </div>
              <div className="bg-white/70 rounded-lg p-6 max-w-lg mx-auto ml-[0px] mr-[0px]">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 mb-1">AI Generated Message:</p>
                    <p className="text-sm text-gray-600 italic">"Happy birthday Sara! 🎉 Hope your special day is filled with joy, laughter, and all your favorite things. Can't wait to celebrate with you!"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#5abff2]">
                <CalendarHeart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-dark-grey mb-2">Track Special Dates</h3>
              <p className="text-gray-600">
                Birthdays, anniversaries, and other important events with color-coded urgency indicators.
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
                Customizable notifications days, weeks, or months before important dates.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#5abff2]">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-dark-grey mb-2">Relationship Management</h3>
              <p className="text-gray-600">
                Organize contacts by family, friends, colleagues, and partners with personal notes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Features */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-dark-grey mb-2">Coming Soon</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're constantly working to make Memento even better. Here's what's coming next:
            </p>
          </div>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-teal-500">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-4 py-1">
                  <Clock className="w-4 h-4 mr-2" />
                  Coming Soon
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-dark-grey mb-4">AI-Powered Gift Suggestions</h3>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
                Never run out of gift ideas again! Our AI will analyze your relationships, past preferences, 
                and special occasions to suggest personalized gift ideas that show you really care.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <Badge variant="outline" className="bg-white/50">🎁 Personalized Recommendations</Badge>
                <Badge variant="outline" className="bg-white/50">💡 Budget-Friendly Options</Badge>
                <Badge variant="outline" className="bg-white/50">🛍️ Shopping Links</Badge>
                <Badge variant="outline" className="bg-white/50">⭐ Trending Ideas</Badge>
              </div>
              <div className="bg-white/70 rounded-lg p-6 max-w-lg mx-auto ml-[0px] mr-[0px]">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 mb-1">AI Gift Suggestion Preview:</p>
                    <p className="text-sm text-gray-600 italic">"Based on Sara's love for reading and coffee, consider a beautiful book journal paired with artisanal coffee beans - perfect for her cozy morning routine!"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            Made with ❤️ using Replit
          </p>
        </div>
      </div>
    </div>
  );
}