import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createAllReceiptTemplates, createLaybyeTemplates } from '@/lib/create-laybye-templates'
import { useBranch } from '@/context/BranchContext'
import { toast } from 'sonner'
import { Database, FileText, Loader2 } from 'lucide-react'

const CreateTemplatesButton = () => {
  const { selectedBranch } = useBranch()
  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingLaybye, setIsCreatingLaybye] = useState(false)

  const handleCreateAllTemplates = async () => {
    if (!selectedBranch?.id) {
      toast.error('Please select a branch first')
      return
    }

    setIsCreating(true)
    try {
      const result = await createAllReceiptTemplates(selectedBranch.id)
      
      if (result.success) {
        const successCount = result.results.filter(r => r.success).length
        const totalCount = result.results.length
        
        toast.success(`✅ Created ${successCount}/${totalCount} receipt templates for ${selectedBranch.name}!`)
        
        // Refresh the page to show the new templates
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error('Failed to create templates: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating templates:', error)
      toast.error('Failed to create templates')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateLaybyeTemplates = async () => {
    if (!selectedBranch?.id) {
      toast.error('Please select a branch first')
      return
    }

    setIsCreatingLaybye(true)
    try {
      const result = await createLaybyeTemplates(selectedBranch.id)
      
      if (result.success) {
        toast.success(`✅ Created laybye receipt templates for ${selectedBranch.name}!`)
        
        // Refresh the page to show the new templates
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error('Failed to create laybye templates: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating laybye templates:', error)
      toast.error('Failed to create laybye templates')
    } finally {
      setIsCreatingLaybye(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Create Receipt Templates
          </CardTitle>
          <CardDescription>
            Create all receipt templates for your branch. This will set up templates for sales, laybye, refunds, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              onClick={handleCreateAllTemplates} 
              disabled={isCreating || !selectedBranch}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating All Templates...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Create All Receipt Templates
                </>
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              This will create 16 receipt templates including:
              <ul className="mt-2 ml-4 space-y-1">
                <li>• KQS Retail Receipt</li>
                <li>• KQS Laybye Payment Receipt</li>
                <li>• KQS Laybye Reserve Slip</li>
                <li>• KQS Refund Slip</li>
                <li>• And 12 more templates...</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Laybye Templates Only
          </CardTitle>
          <CardDescription>
            Create only the laybye receipt templates if you just need those.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCreateLaybyeTemplates} 
            disabled={isCreatingLaybye || !selectedBranch}
            variant="outline"
            className="w-full"
          >
            {isCreatingLaybye ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Laybye Templates...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Create Laybye Templates Only
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateTemplatesButton
