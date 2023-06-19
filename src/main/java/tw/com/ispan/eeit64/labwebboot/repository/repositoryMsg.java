package tw.com.ispan.eeit64.labwebboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tw.com.ispan.eeit64.labwebboot.entity.MemberBean;
import tw.com.ispan.eeit64.labwebboot.entity.MessageBean;

import java.util.List;
import java.util.Objects;

@Repository
public interface repositoryMsg extends JpaRepository<MessageBean,Integer> {
    @Query(value = "select m.memberBean,m.msg,m.messageid from MessageBean m WHERE  m.memberBean.id>:a1 AND m.msg LIKE :a2")
    List<Object []> method1(@Param("a1") Integer id,@Param("a2") String msg);

}
