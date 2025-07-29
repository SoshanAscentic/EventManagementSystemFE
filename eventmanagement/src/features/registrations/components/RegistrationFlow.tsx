import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/molecules'
import { Icon } from '@/components/atoms'
import { EventDto } from '@/shared/types/domain'

interface RegistrationFlowProps {
  event: EventDto
  onComplete: (data: { eventId: number; notes?: string }) => Promise<void>
  loading?: boolean
}

export const RegistrationFlow = ({ event, onComplete, loading }: RegistrationFlowProps) => {
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onComplete({
      eventId: event.id,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-xl">Register for Event</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Event Summary */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Icon name="Calendar" className="mr-2 h-5 w-5 text-blue-600" />
              Event Details
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Event:</strong> {event.title}</p>
              <p><strong>Date:</strong> {new Date(event.startDateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Venue:</strong> {event.venue}</p>
              <p><strong>Address:</strong> {event.address}</p>
              <p><strong>Available Spots:</strong> {event.remainingCapacity}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notes Field */}
            <FormField 
              label="Notes (Optional)"
              description="Any special requirements, dietary restrictions, or comments"
            >
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg min-h-[100px] resize-y focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Enter any special requirements, dietary restrictions, or comments..."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {notes.length}/500 characters
              </div>
            </FormField>

            {/* Registration Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Registration Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• You will be registered for this event immediately</p>
                <p>• You can cancel your registration anytime before the event</p>
                <p>• Event updates will be sent to your registered email</p>
                <p>• Please arrive 15 minutes before the start time</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button 
                type="button"
                variant="outline" 
                className="flex-1"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                Back to Event
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading || event.remainingCapacity === 0}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : event.remainingCapacity === 0 ? (
                  <>
                    <Icon name="X" className="mr-2 h-4 w-4" />
                    Event Full
                  </>
                ) : (
                  <>
                    <Icon name="Check" className="mr-2 h-4 w-4" />
                    Complete Registration
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}