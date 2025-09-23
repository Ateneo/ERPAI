"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CustomersLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-[200px]" />
          <Skeleton className="h-10 w-full sm:w-[200px]" />
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
