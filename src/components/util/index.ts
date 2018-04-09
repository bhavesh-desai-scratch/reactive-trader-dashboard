export const createTopic = (serviceType: string) => {
    return 'topic_' + serviceType + '_' + (Math.random() * Math.pow(36, 8) << 0).toString(36)
}