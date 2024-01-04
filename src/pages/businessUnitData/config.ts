export const statusConfig = {
    1: { text: 'Asin Received' },
    2: {
        text: 'Script Completed',
        status: 'Success',
    },
    3: {
        text: 'PM Denied',
        status: 'online',
    },
    4: {
        text: 'PM Submitted',
        status: 'Success',
        //   disabled: true,
    },
    5: {
        text: 'Not Passed',
        status: 'Error',
    },
    6: {
        text: 'Passed',
        status: 'Success',
    },
    7: {
        // Standard Sales
        text: 'Standard Sales',
        status: 'Success',
    },
    8: {
        // Standard Fail
        text: 'Standard Fail',
        status: 'Error',
    },
    // 增加状态9 等待操作员审核
    9: {
        text: 'Waiting Operator Review',
        status: 'Warning',
    }
}