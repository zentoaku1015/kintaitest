import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import ExcelJS from 'exceljs'
import { getSession } from '@/app/actions'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    const session = await getSession()
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startStr = searchParams.get('start')
    const endStr = searchParams.get('end')

    if (!startStr || !endStr) {
        return new NextResponse('Missing start or end date', { status: 400 })
    }

    const startDate = new Date(startStr)
    const endDate = new Date(endStr)

    // Adjust endDate to include the full day
    const endDateOnQuery = new Date(endDate)
    endDateOnQuery.setHours(23, 59, 59, 999)

    // Fetch logs
    const logs = await prisma.attendance.findMany({
        where: {
            userId: session.userId,
            timestamp: {
                gte: startDate,
                lte: endDateOnQuery
            }
        },
        orderBy: { timestamp: 'asc' },
        include: { store: true }
    })

    // Create Workbook
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('勤怠表')

    // Set Columns
    sheet.columns = [
        { header: '日付', key: 'date', width: 15 },
        { header: '曜日', key: 'day', width: 8 },
        { header: '出勤時刻', key: 'in', width: 15 },
        { header: '退勤時刻', key: 'out', width: 15 },
        { header: '休憩(h)', key: 'break', width: 10 },
        { header: '実働(h)', key: 'work', width: 10 },
        { header: '店舗', key: 'store', width: 15 },
        { header: 'ステータス/申請', key: 'status', width: 20 },
        { header: '備考', key: 'note', width: 30 },
    ]

    // Style Header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } }

    // Generate Dates
    const currentDate = new Date(startDate)
    let rowIndex = 2

    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][currentDate.getDay()]

        // Find logs for this day
        const dayLogs = logs.filter(l => {
            const lDate = new Date(l.timestamp)
            return lDate.getDate() === currentDate.getDate() &&
                lDate.getMonth() === currentDate.getMonth() &&
                lDate.getFullYear() === currentDate.getFullYear()
        })

        const row = sheet.getRow(rowIndex)
        row.getCell('date').value = dateStr
        row.getCell('day').value = dayOfWeek

        // Style Sunday/Saturday
        if (currentDate.getDay() === 0) row.getCell('date').font = { color: { argb: 'FFFF0000' } } // Red
        if (currentDate.getDay() === 6) row.getCell('date').font = { color: { argb: 'FF0000FF' } } // Blue

        // Logic
        if (dayLogs.length > 0) {
            // Has attendance
            const clockIn = dayLogs.find(l => l.type === 'CLOCK_IN')
            const clockOut = dayLogs.find(l => l.type === 'CLOCK_OUT')

            if (clockIn) row.getCell('in').value = clockIn.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
            if (clockOut) row.getCell('out').value = clockOut.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

            // Calc
            if (clockIn && clockOut) {
                row.getCell('break').value = 1
                const diff = clockOut.timestamp.getTime() - clockIn.timestamp.getTime()
                const hours = (diff / (1000 * 60 * 60)) - 1
                row.getCell('work').value = Math.max(0, parseFloat(hours.toFixed(2)))
            }

            if (clockIn?.store) row.getCell('store').value = clockIn.store.name

            if (clockIn?.note) row.getCell('note').value = clockIn.note

            // Lock cells for times if data exists
            // ExcelJS protection works by protecting the sheet and unlocking specific cells.
            // But user requirement says: "Lock logged times", "Allow dropdown for others".
            // So we will lock the row by default (if sheet is protected) but we need to unlock "Status" if NO data.
            // Actually, Excel sheet protection is global. 
            // Strategy: 
            // 1. Protect Sheet.
            // 2. Unlock "Status" column for ALL rows (allow user to edit).
            // 3. LOCK "Status" column IF there is attendance (Attendance takes priority).
            // 4. Unlock "Time" columns ONLY if NO attendance (Allow manual entry? No, user said lock logged times).
            // User request: "Lock logged times", "Input dropdown for NON-attendance days".

            // Implementation:
            // Cells are locked by default when sheet is protected.
            // We unlock the "Status" cell only if there is NO attendance.

        } else {
            // No attendance
            // Add Dropdown to 'status'
            const statusCell = row.getCell('status')
            statusCell.dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"定休,有給休暇,代休"']
            }
            // To allow editing this cell when sheet is protected:
            statusCell.protection = { locked: false }

            // Also allow 'note' editing?
            row.getCell('note').protection = { locked: false }
        }

        currentDate.setDate(currentDate.getDate() + 1)
        rowIndex++
    }

    // Protect Sheet (password is empty effectively, or set one)
    await sheet.protect('password', { // Simple password
        selectLockedCells: true,
        selectUnlockedCells: true,
        formatCells: false,
        formatColumns: false,
        formatRows: false,
        insertColumns: false,
        insertRows: false,
        insertHyperlinks: false,
        deleteColumns: false,
        deleteRows: false,
        sort: false,
        autoFilter: false,
        pivotTables: false
    })

    // Buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="attendance_${session.userId}_${startStr}.xlsx"`
        }
    })
}
