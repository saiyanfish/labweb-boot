package tw.com.ispan.eeit64.labwebboot.controller;

import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

@Controller
@ServerEndpoint(value = "/websocket/{room}")
//@Component
public class server {
    private static Set<Session> sessions;
    private static Map<String, Set<Session>> roomMap;

    public server() {

        if (sessions == null) {
            sessions = new HashSet<>();
            roomMap = new HashMap<>();
        }
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("room") String room) {
        System.out.println("onOpen()" + session.toString());
//        session.setMaxIdleTimeout(10 * 1000);
        if (sessions.add(session)) {
            addUserToRoom(room, session); // 加入指定的房間
        }

    }

    @OnClose
    public void onClose(Session session) {
//        System.out.println("onClose()");
        sessions.remove(session);
        removeUserFromAllRooms(session);
    }

    @OnError
    public void onError(Session session, Throwable t) {
        System.out.println("onError()" + t.toString());
        sessions.remove(session);
        removeUserFromAllRooms(session);
    }

    @OnMessage
    public void onMessage(String msg, Session session) {
//        System.out.println(msg);

        String room = getRoomForUser(session);
        if (room != null) {
            Set<Session> usersInRoom = getUsersInRoom(room);
            for (Session user : usersInRoom) {
                try {
                    user.getBasicRemote().sendText(msg);
                } catch (Exception e) {
                    e.printStackTrace();
                    System.out.println();
                }
            }
        }
    }

    private void addUserToRoom(String room, Session session) {
        Set<Session> users = roomMap.getOrDefault(room, new HashSet<>());
        users.add(session);
        roomMap.put(room, users);
    }

    private void removeUserFromRoom(String room, Session session) {
        Set<Session> users = roomMap.get(room);
        if (users != null) {
            users.remove(session);
            if (users.isEmpty()) {
                roomMap.remove(room);
            }
        }
    }

    private void removeUserFromAllRooms(Session session) {
        for (Set<Session> users : roomMap.values()) {
            users.remove(session);
        }
    }

    private Set<Session> getUsersInRoom(String room) {
        return roomMap.getOrDefault(room, new HashSet<>());
    }

    private String getRoomForUser(Session session) {
        for (Map.Entry<String, Set<Session>> entry : roomMap.entrySet()) {
            if (entry.getValue().contains(session)) {
                return entry.getKey();
            }
        }
        return null;
    }
}
