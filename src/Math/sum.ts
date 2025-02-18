export function sum(nums: readonly number[]): number {
    let result = 0;
    const len = nums.length;
    for (let i = 0; i < len; i++) {
        result += nums[i];
    }

    return result;
}
