export interface SimEvent<T> {
	time: number;
	kind: T;
}