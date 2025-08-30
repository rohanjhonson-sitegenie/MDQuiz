import { useState } from 'react'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DecisionNode {
  id: string
  question: string
  options: {
    label: string
    nextId?: string
    result?: string
  }[]
}

interface DecisionTreeProps {
  title: string
  nodes: DecisionNode[]
  className?: string
}

export function DecisionTree({ title, nodes, className }: DecisionTreeProps) {
  const [currentNodeId, setCurrentNodeId] = useState(nodes[0]?.id)
  const [history, setHistory] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)

  const currentNode = nodes.find((node) => node.id === currentNodeId)

  const handleOptionClick = (option: DecisionNode['options'][0]) => {
    if (option.result) {
      setResult(option.result)
    } else if (option.nextId) {
      setHistory([...history, currentNodeId])
      setCurrentNodeId(option.nextId)
    }
  }

  const handleReset = () => {
    setCurrentNodeId(nodes[0]?.id)
    setHistory([])
    setResult(null)
  }

  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history]
      const previousNodeId = newHistory.pop()
      setHistory(newHistory)
      setCurrentNodeId(previousNodeId!)
      setResult(null)
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>{title}</span>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleReset}
            disabled={history.length === 0 && !result}
          >
            <RotateCcw className='h-4 w-4' />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className='space-y-4'>
            <div className='bg-primary/10 rounded-lg p-4'>
              <h3 className='mb-2 font-semibold'>Recommendation:</h3>
              <p>{result}</p>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={handleBack}>
                Back
              </Button>
              <Button variant='outline' onClick={handleReset}>
                Start Over
              </Button>
            </div>
          </div>
        ) : currentNode ? (
          <div className='space-y-4'>
            <p className='text-lg font-medium'>{currentNode.question}</p>
            <div className='space-y-2'>
              {currentNode.options.map((option, index) => (
                <Button
                  key={index}
                  variant='outline'
                  className='w-full justify-between text-left'
                  onClick={() => handleOptionClick(option)}
                >
                  <span>{option.label}</span>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              ))}
            </div>
            {history.length > 0 && (
              <Button variant='ghost' onClick={handleBack} className='w-full'>
                Back to previous question
              </Button>
            )}
          </div>
        ) : (
          <p>No decision tree data available.</p>
        )}
      </CardContent>
    </Card>
  )
}
