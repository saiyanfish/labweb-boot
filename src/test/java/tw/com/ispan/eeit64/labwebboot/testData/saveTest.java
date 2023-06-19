package tw.com.ispan.eeit64.labwebboot.testData;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import tw.com.ispan.eeit64.labwebboot.entity.MemberBean;
import tw.com.ispan.eeit64.labwebboot.entity.MessageBean;

import javax.persistence.PersistenceContext;
@SpringBootTest
public class saveTest {
    @PersistenceContext
    Session session;
    @Test
    void sessionTst(){
   Transaction xx= session.beginTransaction();
        MessageBean m1 =new MessageBean();
        m1.setMsg("ddd");
        MemberBean member =session.get(MemberBean.class,1);
        m1.setMemberBean(member);
        session.save(m1);
        xx.commit();
        session.close();

    }
}
