
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardContentProps {
  activeModule: string;
}

const DashboardContent = ({ activeModule }: DashboardContentProps) => {
  // Placeholder welcome content for dashboard
  const renderDashboardContent = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Your sales performance this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center bg-tellerpos-dark-accent/30 rounded-md">
            Sales chart will be implemented here
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            15% increase from last month
          </p>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Popular Products</CardTitle>
          <CardDescription>Your top selling items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center bg-tellerpos-dark-accent/30 rounded-md">
            Product list will be implemented here
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Updated 2 hours ago
          </p>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center bg-tellerpos-dark-accent/30 rounded-md">
            Transaction list will be implemented here
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Last transaction 5 minutes ago
          </p>
        </CardFooter>
      </Card>
    </div>
  );
  
  // Placeholder content for other modules
  const renderPlaceholderContent = (moduleName: string) => (
    <div className="bg-tellerpos-dark-accent/20 border border-tellerpos-dark-accent/30 rounded-lg p-8 text-center">
      <h2 className="text-2xl font-bold text-tellerpos mb-4">{moduleName} Module</h2>
      <p className="text-tellerpos-gray-light">
        This module will be implemented in future updates. Stay tuned!
      </p>
    </div>
  );
  
  return (
    <main className="flex-1 overflow-auto p-6">
      {activeModule === "dashboard" ? (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              {renderDashboardContent()}
            </TabsContent>
            <TabsContent value="analytics" className="mt-6">
              {renderPlaceholderContent("Analytics")}
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
              {renderPlaceholderContent("Reports")}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          {renderPlaceholderContent(activeModule.charAt(0).toUpperCase() + activeModule.slice(1))}
        </div>
      )}
    </main>
  );
};

export default DashboardContent;
