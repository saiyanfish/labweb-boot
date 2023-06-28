package tw.com.ispan.eeit64.labwebboot.controller;

import org.json.JSONObject;
import org.json.JSONString;
import org.springframework.stereotype.Controller;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.nio.ByteBuffer;
import java.util.*;
import java.util.concurrent.CountDownLatch;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

@Controller
@ServerEndpoint(value = "/websocket/{room}")
//@Component
public class server {
    private static Set<Session> sessions;
    private static Map<String, Set<Session>> roomMap;
//    private CountDownLatch dataMessageLatch = new CountDownLatch(1);

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
        try {
            // 等待 onDataMessage 處理完畢
//            dataMessageLatch.await();
            System.out.println(msg);
            System.out.println("data:string");

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
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @OnMessage
    public void onDataMessage(InputStream inputStream, Session session) {
        String room = getRoomForUser(session);
        System.out.println("data:data");

        if (room != null) {
            Set<Session> usersInRoom = getUsersInRoom(room);
            byte[] buffer = new byte[8192];
            int bytesRead;
            try {
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    byte[] data = Arrays.copyOf(buffer, bytesRead);
                    ByteBuffer byteBuffer = ByteBuffer.wrap(data);
                    for (Session user : usersInRoom) {
                        try {
                            RemoteEndpoint.Basic remote = user.getBasicRemote();
                            remote.sendBinary(byteBuffer);

                        } catch (IOException e) {
//                            e.printStackTrace();
                        }

                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
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
