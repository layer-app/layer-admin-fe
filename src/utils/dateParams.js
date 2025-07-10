export function getDateParams(dateRange) {
    return {
        startDate: dateRange?.[0]?.format('YYYY-MM-DDTHH:mm:ss'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DDTHH:mm:ss'),
    };
}
