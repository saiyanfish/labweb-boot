package tw.com.ispan.eeit64.labwebboot.testData;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import tw.com.ispan.eeit64.labwebboot.entity.MemberBean;
import tw.com.ispan.eeit64.labwebboot.entity.MessageBean;
import tw.com.ispan.eeit64.labwebboot.service.impl.MemberService;

import javax.transaction.Transactional;
import java.util.List;

@SpringBootTest
public class serviceTest {
    @Autowired
    private MemberService memberService;

    @Test
    void service1() {
        MemberBean memberBean =new MemberBean();
        boolean result =false;
        memberBean.setId(4);
        result=memberService.delete(memberBean);
        System.out.println(result);
    }
    @Test
    void serviceUpdate(){
        MemberBean memberBean =new MemberBean();
        memberBean.setId(2);
        memberBean.setBio("ii");
        memberService.update(memberBean);
    }
    @Test
    void serviceInsert(){
        MemberBean memberBean =new MemberBean();
         memberBean.setId(7);
        memberBean.setBio("70");
        memberService.insert(memberBean);
    }
    @Test
    @Transactional
    void select(){
       List<MemberBean> ms= memberService.select(null);
       for(MemberBean mm:ms){
           System.out.println(mm.getBio());
       }
    }
}
