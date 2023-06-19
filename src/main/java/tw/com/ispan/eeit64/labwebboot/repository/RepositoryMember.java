package tw.com.ispan.eeit64.labwebboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tw.com.ispan.eeit64.labwebboot.entity.MemberBean;

import java.util.List;
@Repository
public interface RepositoryMember extends JpaRepository<MemberBean,Integer> {
    @Query(value = "from MemberBean  where  id > :ss")
    List<MemberBean> method1(@Param("ss") Integer id);
}
