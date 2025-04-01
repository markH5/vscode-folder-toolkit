export function sum(nums: readonly number[]): number {
    let result = 0;
    const len = nums.length;
    for (let i = 0; i < len; i += 1) {
        result += nums[i];
    }

    return result;
}
