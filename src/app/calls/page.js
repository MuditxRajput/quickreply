"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axios from "axios"
import { ArrowRight, BarChart2, Clock, Phone, Upload } from "lucide-react"
import { useState } from "react"
import CallDetailModal from "./CallDetailModal"
import CallMetrics from "./CallMetrics"
import CallTable from "./CallTable"
import ContactList from "./ContactList"
import UploadCSV from "./UploadCSV"

export default function AICallsPage() {
  const [selectedCall, setSelectedCall] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  // Function to Call All Contacts
  const handleCallAll = async () => {
    try {
      setLoading(true)
      const response = await axios.post("/api/calls/start-all")
      alert("All calls initiated successfully!")
    } catch (error) {
      console.error("Error starting calls:", error)
      alert("Failed to start calls.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4 md:px-6 max-w-7xl">
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">AI Calls Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage and monitor your automated call campaigns</p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setActiveTab("upload")} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Contacts
                </Button>
                <Button onClick={handleCallAll} disabled={loading} className="gap-2">
                  <Phone className="h-4 w-4" />
                  {loading ? "Calling..." : "Call All Contacts"}
                </Button>
              </div>
            </div>
          </header>

          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Total Calls"
                  value="128"
                  description="+12% from last week"
                  icon={<Phone className="h-5 w-5" />}
                />
                <MetricCard
                  title="Success Rate"
                  value="86%"
                  description="4% higher than average"
                  icon={<BarChart2 className="h-5 w-5" />}
                />
                <MetricCard
                  title="Avg. Duration"
                  value="3:24"
                  description="2:12 for successful calls"
                  icon={<Clock className="h-5 w-5" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Call Performance</CardTitle>
                    <CardDescription>Metrics and analytics for your calls</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CallMetrics />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Active Contacts</CardTitle>
                      <CardDescription>Contacts ready for calling</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      View All <ArrowRight className="h-3 w-3" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ContactList />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Calls</CardTitle>
                  <CardDescription>History of your recent AI calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <CallTable setSelectedCall={setSelectedCall} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Management</CardTitle>
                  <CardDescription>View and manage your contact list</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Button onClick={handleCallAll} disabled={loading} className="gap-2">
                      <Phone className="h-4 w-4" />
                      {loading ? "Calling..." : "Call All Contacts"}
                    </Button>
                  </div>
                  <ContactList expanded={true} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Contacts</CardTitle>
                  <CardDescription>Import your contacts via CSV file</CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadCSV />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {selectedCall && <CallDetailModal call={selectedCall} onClose={() => setSelectedCall(null)} />}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, description, icon }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <h3 className="text-sm font-medium tracking-tight text-muted-foreground">{title}</h3>
          <div className="bg-primary/10 p-2 rounded-full text-primary">{icon}</div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

