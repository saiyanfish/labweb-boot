package tw.com.ispan.eeit64.labwebboot.testData;

import org.hibernate.Session;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.persistence.PersistenceContext;
import java.sql.Array;
import java.util.List;

@SpringBootTest
public class SessionFactoryTest {
    @PersistenceContext
    private Session session;
    @Test
    void sessionTest(){
        List<Object[]> list=session.createNativeQuery("select * from DEPT").list();
         if(list!=null && !list.isEmpty()){
             for(Object[] ss:list){
                 System.out.println(ss[1]);
             }

         }
    }

}
