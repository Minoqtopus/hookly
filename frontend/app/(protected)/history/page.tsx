"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGeneration } from "@/domains/generation";
import { FileText, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  
  const { generations, isLoading } = useGeneration();

  const filteredGenerations = useMemo(() => {
    return generations.filter((gen) => {
      const matchesSearch = gen.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = platformFilter === "all" || gen.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [generations, searchTerm, platformFilter]);

  const calculateViralScore = (gen: any) => {
    if (gen.performance_data) {
      const { views, clicks, engagement_rate } = gen.performance_data;
      return Math.min(10, (engagement_rate + (clicks / views) * 100) / 2).toFixed(1);
    }
    return "5.0";
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Generation History</h1>
        <p className="text-muted-foreground mt-1">
          Review, manage, and export your past generations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Generations</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by title..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">X (Twitter)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Viral Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading generations...
                  </TableCell>
                </TableRow>
              ) : filteredGenerations.length > 0 ? (
                filteredGenerations.map((gen) => (
                  <TableRow key={gen.id}>
                    <TableCell className="font-medium">{gen.title}</TableCell>
                    <TableCell className="capitalize">{gen.platform}</TableCell>
                    <TableCell>{new Date(gen.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{calculateViralScore(gen)}/10</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchTerm || platformFilter !== "all" 
                      ? "No generations found matching your filters." 
                      : "No generations yet. Create your first one in the Generate tab!"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}