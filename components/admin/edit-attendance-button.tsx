'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { updateAttendanceLog } from '@/app/admin-actions'
import { Pencil } from 'lucide-react'

export function EditAttendanceButton({ logId, currentTimestamp, modifierId }: { logId: string, currentTimestamp: Date, modifierId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [dateVal, setDateVal] = useState(new Date(currentTimestamp).toISOString().slice(0, 16)) // YYYY-MM-DDTHH:mm

    const handleUpdate = async () => {
        await updateAttendanceLog(logId, dateVal, modifierId)
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Pencil className="w-3 h-3" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>打刻修正</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        type="datetime-local"
                        value={dateVal}
                        onChange={(e) => setDateVal(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>キャンセル</Button>
                    <Button onClick={handleUpdate}>修正保存</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
