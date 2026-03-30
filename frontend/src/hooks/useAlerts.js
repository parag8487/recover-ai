import { useEffect } from 'react'
import { io } from 'socket.io-client'
import useStore from '../store/useStore'

const useAlerts = (patientId) => {
    const addAlert = useStore((state) => state.addAlert)

    useEffect(() => {
        if (!patientId) return

        const socket = io(window.location.origin)

        socket.on('connect', () => {
            socket.emit('join', patientId)
        })

        socket.on('health_alert', (data) => {
            addAlert(data)
        })

        return () => {
            socket.disconnect()
        }
    }, [patientId, addAlert])
}

export default useAlerts
